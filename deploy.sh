docker stop $(docker ps -q)
for id in $(sudo docker ps -aq); do
    sudo docker rm -f $id
done
docker rmi smpny7/vivace-api -f
cd vivace-api
git reset --hard HEAD^
git pull
docker build -t smpny7/vivace-api .
docker run -p 8080:3000 -d smpny7/vivace-api
