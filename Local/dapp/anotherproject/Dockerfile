FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g truffle

EXPOSE 8585

EXPOSE 8080

CMD ["truffle", "migrate", "--network", "development"]