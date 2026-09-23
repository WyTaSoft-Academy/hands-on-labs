from pyspark.sql import functions as F
from pyspark.sql import Row

# Much smaller volumes for training
num_trans = 200_000      # instead of 5,000,000
num_clients = 50_000     # instead of 1,000,000

countries_major = ["FR"]   # 90%
countries_minor = ["DE", "IT", "ES", "US", "UK", "CA", "BR", "IN", "JP"]  # 10%

# Generate transactions (fact table)
transactions = (
    spark.range(0, num_trans)
    .withColumn("trans_id", F.concat(F.lit("T"), F.col("id")))
    .withColumn(
        "country",
        F.when(F.rand() < 0.9, F.lit("FR")).otherwise(
            F.element_at(
                F.array(*[F.lit(c) for c in countries_minor]),
                (F.rand() * len(countries_minor)).cast("int") + 1
            )
        )
    )
    .withColumn("amount", (F.rand() * 1000).cast("double"))
    .drop("id")
)

# Generate clients (dimension table)
clients = (
    spark.range(0, num_clients)
    .withColumn("client_id", F.concat(F.lit("C"), F.col("id")))
    .withColumn(
        "country",
        F.when(F.rand() < 0.9, F.lit("FR")).otherwise(
            F.element_at(
                F.array(*[F.lit(c) for c in countries_minor]),
                (F.rand() * len(countries_minor)).cast("int") + 1
            )
        )
    )
    .drop("id")
)

