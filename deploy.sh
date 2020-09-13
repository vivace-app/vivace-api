cd vivace-api
docker-compose down
docker image rm vivace-api_nodejs
git pull
docker-compose up -d
