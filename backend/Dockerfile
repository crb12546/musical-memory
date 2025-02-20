FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy application code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "alembic>=1.13.1" "psycopg2-binary>=2.9.9" && \
    pip install --no-cache-dir -e .

# Make start script executable
RUN chmod +x start.sh

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run the start script
CMD ["./start.sh"]
