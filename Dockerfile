FROM node

WORKDIR /usr/src/vivace-api

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080
CMD [ "node", "dist/app.js" ]
