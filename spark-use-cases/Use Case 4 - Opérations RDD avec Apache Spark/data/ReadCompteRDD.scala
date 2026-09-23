import org.apache.spark.{SparkConf, SparkContext}

object ReadCompteRDD {
  def main(args: Array[String]): Unit = {
    val conf = new SparkConf()
      .setAppName("ReadCompteRDD")
      .setMaster("local[*]")
    val sc = new SparkContext(conf)

    // Lecture du fichier
    val rdd = sc.textFile("compte.csv")

    // Récupérer l'en-tête pour le retirer ensuite
    val header = rdd.first()

    // Parser les lignes (hors en-tête)
    val comptes = rdd
      .filter(line => line != header)        // retire l'en-tête
      .map(_.split(","))                       // découpe sur la virgule
      .map(cols => (cols(0), cols(1), cols(2))) // (client_id, name, account_type)

    // Affichage
    comptes.collect().foreach(println)

    sc.stop()
  }
}