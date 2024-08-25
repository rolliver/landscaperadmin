#!/bin/bash

# Database connection details
DB_HOST="db"
DB_NAME="landscaping_scheduler"
DB_USER="lsadmin"
DB_PASSWORD="wVaxVojCbomBaQakxe2X"
DB_PORT="5432"
DB_CONTAINER_NAME="db"  # Assuming the container name is "db" as per your Docker Compose file

# Backup settings
BACKUP_DIR="/Users/rod/lsproject/dbback/"
TIMESTAMP=$(date +"%F_%T")
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$TIMESTAMP.sql"

# Ensure the backup directory exists
mkdir -p "$BACKUP_DIR"

# Export the password so pg_dump can use it
export PGPASSWORD="$DB_PASSWORD"

# Run the pg_dump command inside the Docker container
docker exec -e PGPASSWORD="$DB_PASSWORD" -t "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -F c -b -v -f "/tmp/$DB_NAME-$TIMESTAMP.sql" "$DB_NAME"

# Copy the backup file from the Docker container to the host machine
docker cp "$DB_CONTAINER_NAME:/tmp/$DB_NAME-$TIMESTAMP.sql" "$BACKUP_FILE"

# Remove the backup file from the Docker container
docker exec -t "$DB_CONTAINER_NAME" rm "/tmp/$DB_NAME-$TIMESTAMP.sql"

# Unset the password variable for security
unset PGPASSWORD

# Print completion message
echo "Backup completed: $BACKUP_FILE"


#docker exec -e PGPASSWORD="wVaxVojCbomBaQakxe2X" -t db pg_restore -U lsadmin -d landscaping_scheduler -h db -p 5432 -v "/tmp/backup.sql"

