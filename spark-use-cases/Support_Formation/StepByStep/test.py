from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, IntegerType, StringType

# Correcting the SparkSession instantiation
spark = SparkSession.builder \
    .appName("Transaction Analysis") \
    .getOrCreate()

# Données de transactions
transactions = [
    {"id": 1, "montant": 500, "carte": "crédit", "pays": "US", "heure": "10:00"},
    {"id": 2, "montant": 2000, "carte": "débit", "pays": "FR", "heure": "15:30"},
    {"id": 3, "montant": 1500, "carte": "crédit", "pays": "IN", "heure": "11:00"},
    {"id": 4, "montant": 300, "carte": "débit", "pays": "US", "heure": "09:45"}
]

# Defining the schema for the DataFrame
transaction_schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("montant", IntegerType(), True),
    StructField("carte", StringType(), True),
    StructField("pays", StringType(), True),
    StructField("heure", StringType(), True)
])

# Creating the DataFrame with Spark
transactions_df = spark.createDataFrame(transactions, schema=transaction_schema)

# Show the DataFrame
transactions_df.show()
