import org.apache.spark.sql.{DataFrame}
import org.apache.spark.sql.types._
import org.apache.spark.sql.functions._

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

display(rawDF)

// 3. Nettoyage et filtrages
val cleanDF: DataFrame = rawDF
  .filter(col("cancelled") === 0)                           // on ne garde que les connexions non annulées
  .filter(col("location").isNotNull && col("connection_duration") >= 0)

// 4. Agrégation
val avgByLoc: DataFrame = cleanDF
  .groupBy("location")
  .agg(avg("connection_duration").alias("average_duration"))

// 5. Répartition et écriture
avgByLoc
  .repartition(col("location"))                             // regroupe par location pour écrire un fichier par partition
  .write
  .mode("overwrite")
  .parquet("/FileStore/tables/user_connections_before/")
