FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY requirements.txt .
RUN pip install -r requirements.txt && \
    pip install "alembic>=1.13.1" "psycopg2-binary>=2.9.9" && \
    pip install --no-cache-dir -e .

COPY . .

# Make start script executable
COPY start.sh .
RUN chmod +x start.sh

# Run the start script
CMD ["./start.sh"]
