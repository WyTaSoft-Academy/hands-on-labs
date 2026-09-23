from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, IntegerType, StringType
from pyspark.sql.functions import when, col, lit


# Données de transactions
transactions = [
 {"id": 1, "montant": 500, "carte": "crédit", "pays": "US", "heure": "10:00"},
 {"id": 2, "montant": 2000, "carte": "débit", "pays": "FR", "heure": "15:30"},
 {"id": 3, "montant": 1500, "carte": "crédit", "pays": "IN", "heure": "11:00"},
 {"id": 4, "montant": 300, "carte": "débit", "pays": "US", "heure": "09:45"}
]
# Paralleliser les transactions
rdd = sc.parallelize(transactions)
# Seuils de risque externes (closure)
facteurs_risque = {
 "crédit": {"seuil_montant": 1000, "risque": 1.2},
 "débit": {"seuil_montant": 500, "risque": 1.5},
 "US": {"risque": 1.1},
 "IN": {"risque": 2.0},
 "FR": {"risque": 1.0}
}

# Define the schema for the transactions
transaction_schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("montant", IntegerType(), True),
    StructField("carte", StringType(), True),
    StructField("pays", StringType(), True),
    StructField("heure", StringType(), True)
])
