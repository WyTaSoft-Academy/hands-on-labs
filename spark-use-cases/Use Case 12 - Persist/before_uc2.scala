import org.apache.spark.sql.{SparkSession, DataFrame}
import org.apache.spark.sql.types._
import org.apache.spark.sql.functions._
import org.apache.spark.storage.StorageLevel

object ConnectionAnalysisWithPersist {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession
      .builder
      .appName("ConnectionAnalysisWithPersist")
      .getOrCreate()

    // 1. Définition du schéma
    val schema = StructType(Array(
      StructField("user_id", IntegerType, true),
      StructField("location", StringType, true),
      StructField("connection_duration", IntegerType, true),
      StructField("service_type", StringType, true),
      StructField("connection_date", TimestampType, true),
      StructField("cancelled", IntegerType, true)
    ))

    // 2. Chargement du CSV
    val rawDF: DataFrame = spark.read
      .schema(schema)
      .option("header", "true")
      .csv("/FileStore/tables/user_connections.csv")

    // 3. Nettoyage et filtrages
    val cleanDF: DataFrame = rawDF
      .filter(col("cancelled") === 0)
      .filter(col("location").isNotNull && col("connection_duration") >= 0)

    // 7. Comptage total
    val totalConnections = cleanDF.count()
    println(s"Total connections (non annulées) = $totalConnections")

    // 8. Durée moyenne par location
    val avgByLocation = cleanDF
      .groupBy("location")
      .agg(avg("connection_duration").alias("avg_duration_loc"))
    avgByLocation.show(10)

    // 9. Durée moyenne et nombre de connexions par type de service
    val statsByService = cleanDF
      .groupBy("service_type")
      .agg(
        count("*").alias("count_service"),
        avg("connection_duration").alias("avg_duration_service")
      )
    statsByService.show()

    // 10. Top 5 utilisateurs par durée totale de connexion
    val topUsers = cleanDF
      .groupBy("user_id")
      .agg(sum("connection_duration").alias("total_duration"))
      .orderBy(desc("total_duration"))
      .limit(5)
    topUsers.show()

    // 11. Tendance quotidienne : durée moyenne par jour
    val dailyTrend = cleanDF
      .withColumn("day", to_date(col("connection_date")))
      .groupBy("day")
      .agg(avg("connection_duration").alias("avg_duration_day"))
      .orderBy("day")
    dailyTrend.show(14)

    // 12. Écriture des résultats (répartition par clé pertinente)
    avgByLocation
      .repartition(col("location"))
      .write.mode("overwrite")
      .parquet("/tables/after/persist/avg_by_location")

    statsByService
      .repartition(col("service_type"))
      .write.mode("overwrite")
      .parquet("/tables/after/persist/stats_by_service")

    topUsers
      .write.mode("overwrite")
      .json("/tables/after/persist/top_users")

    dailyTrend
      .write.mode("overwrite")
      .csv("/tables/after/persist/daily_trend")

    spark.stop()
  }
}
