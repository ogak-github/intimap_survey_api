
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g ngrok

ARG NGROK_TOKEN

ENV NGROK_TOKEN=$NGROK_TOKEN

RUN ngrok config add-authtoken $NGROK_TOKEN

EXPOSE 3005

CMD ["sh", "-c", "npm run dev & ngrok http 3000 --log=stdout"]
