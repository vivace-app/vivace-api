FROM node

WORKDIR /usr/src/vivace-api
COPY . .

ENV TZ Asia/Tokyo
RUN npm install
RUN npm run build

EXPOSE 80 443
CMD [ "node", "dist/app.js" ]
