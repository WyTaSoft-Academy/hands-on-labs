import org.apache.spark.sql.types._
import org.apache.spark.sql.Row

// ---------------------------
// Données de transactions
// ---------------------------
val transactions = Seq(
  Map("id" -> 1, "montant" -> 500,  "carte" -> "crédit", "pays" -> "US", "heure" -> "10:00"),
  Map("id" -> 2, "montant" -> 2000, "carte" -> "débit",  "pays" -> "FR", "heure" -> "15:30"),
  Map("id" -> 3, "montant" -> 1500, "carte" -> "crédit", "pays" -> "IN", "heure" -> "11:00"),
  Map("id" -> 4, "montant" -> 300,  "carte" -> "débit",  "pays" -> "US", "heure" -> "09:45")
)

// Paralleliser les transactions
val rdd = sc.parallelize(transactions)

// ---------------------------
// Facteurs de risque (closure)
// ---------------------------
val facteurs_risque = Map(
  "crédit" -> Map("seuil_montant" -> 1000, "risque" -> 1.2),
  "débit"  -> Map("seuil_montant" -> 500,  "risque" -> 1.5),
  "US"     -> Map("risque" -> 1.1),
  "IN"     -> Map("risque" -> 2.0),
  "FR"     -> Map("risque" -> 1.0)
)

// ---------------------------
// Définition du schéma
// ---------------------------
val transactionSchema = StructType(Seq(
  StructField("id", IntegerType, nullable = true),
  StructField("montant", IntegerType, nullable = true),
  StructField("carte", StringType, nullable = true),
  StructField("pays", StringType, nullable = true),
  StructField("heure", StringType, nullable = true)
))

// Convertir lRDD de Map en RDD[Row] si tu veux un DataFrame
val rowRDD = rdd.map(t =>
  Row(
    t("id").asInstanceOf[Int],
    t("montant").asInstanceOf[Int],
    t("carte").asInstanceOf[String],
    t("pays").asInstanceOf[String],
    t("heure").asInstanceOf[String]
  )
)

// Créer un DataFrame (optionnel)
val df = spark.createDataFrame(rowRDD, transactionSchema)

df.show()
