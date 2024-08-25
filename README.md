

Note the GOOGLE MAPS API key in backend/settings.env -- this is locked to an IP, you'll need to generate your own.

URL something like:   https://console.cloud.google.com/apis/credentials

There is DB connection info also in this file.

Run with docker-compose up --build
docker exec -it efe8d2519706 psql -U lsadmin landscaping_scheduler
