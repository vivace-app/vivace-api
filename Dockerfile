FROM node

# アプリケーションディレクトリを作成する
WORKDIR /usr/src/vivace-api

# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY package*.json ./

RUN npm install
# 本番用にコードを作成している場合
# RUN npm install --only=production

# アプリケーションのソースをバンドルする
COPY . .
RUN npm run build

EXPOSE 8080
CMD [ "node", "dist/app.js" ]
