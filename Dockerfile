FROM node:18-alpine3.18 AS karooo-api-base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
ENV NODE_ENV production
CMD ["npm", "run", "start:prod"]
