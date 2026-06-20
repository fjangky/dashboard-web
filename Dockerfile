FROM node:18-alpine

# Install ss/iproute2 agar backend bisa memindai port ZimaOS jika dibutuhkan
RUN apk add --no-cache iproute2

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]