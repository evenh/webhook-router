FROM node:8-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only-production

COPY . .

VOLUME /etc/webhooks/config.yaml

CMD ["node", "index.js"]