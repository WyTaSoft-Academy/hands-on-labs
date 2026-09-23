# Use an official Python image as the base
FROM python:3.9-slim

# Set the working directory
WORKDIR /wytasoft_training_academy

# Create directory for Spark event logs and assign ownership to appuser
RUN mkdir -p /tmp/spark-events

# Install system dependencies, Java, and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-jre-headless \
    procps \
    curl \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Set Java environment variables
ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64/"
ENV PATH="$JAVA_HOME/bin:$PATH"

# Install Apache Spark
#RUN curl -O https://archive.apache.org/dist/spark/spark-3.3.1/spark-3.3.1-bin-hadoop3.tgz && \
#    tar -xzf spark-3.3.1-bin-hadoop3.tgz -C /usr/local/ && \
#    ln -s /usr/local/spark-3.3.1-bin-hadoop3 /usr/local/spark && \
#    rm spark-3.3.1-bin-hadoop3.tgz

# Set Spark environment variables
#ENV SPARK_HOME="/usr/local/spark"
#ENV PATH="$SPARK_HOME/bin:$PATH"

# Install Poetry using the official installation script
RUN curl -sSL https://install.python-poetry.org | python3 -

# Ensure Poetry is available in the PATH
ENV POETRY_HOME="/root/.local"
ENV PATH="$POETRY_HOME/bin:$PATH"

# Set PYTHONPATH to the project root so Python can find the src directory
ENV PYTHONPATH="/wytasoft_training_academy"

# Configure Poetry to create virtual environments inside the project directory
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

# Verify Poetry installation
RUN poetry --version || (echo "Poetry installation failed!" && exit 1)

# Copy only the dependency files first to leverage Docker layer caching
COPY pyproject.toml poetry.lock ./

# Install dependencies (excluding dev dependencies)
RUN echo $(date) && poetry install

# Copy the entire project into the container
COPY .. .

# Activate Poetry environment in the container
RUN poetry config virtualenvs.create true

# Make sure the virtual environment is activated when running
RUN echo "source $(poetry env info --path)/bin/activate" >> ~/.bashrc

# Copy the Spark submit script and resources
COPY log4j.properties /usr/local/spark/conf/log4j.properties
COPY install/run_spark.sh /wytasoft_training_academy/run_spark.sh
COPY src/main/resources/application.yaml /wytasoft_training_academy/resources/application.yaml
# Create necessary directories before copying data
RUN mkdir -p /prd/project/datalake/transactions /prd/project/datalake/comptes

COPY src/main/resources/data/comptes.csv /prd/project/datalake/comptes/comptes.csv
COPY src/main/resources/data/transactions.csv /prd/project/datalake/transactions/transactions.csv



# Give the script execution permissions
RUN chmod +x /wytasoft_training_academy/run_spark.sh

# Expose necessary ports (4040 for Spark, 8080 for the app)
EXPOSE 4040 8080

# Run the Spark job using the custom script
#CMD ["/wytasoft_training_academy/run_spark.sh"]
CMD ["bash", "-c", "source $(poetry env info --path)/bin/activate && /wytasoft_training_academy/run_spark.sh"]
