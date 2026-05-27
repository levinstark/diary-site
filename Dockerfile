FROM node:22-alpine

WORKDIR /app

# Install git for webhook pulls
RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
