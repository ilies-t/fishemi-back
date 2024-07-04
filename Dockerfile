FROM node:18-alpine3.18 AS karooo-api-base
WORKDIR /app
COPY package*.json ./

FROM karooo-api-base AS dev
RUN npm ci
COPY . .
EXPOSE 5000

FROM karooo-api-base AS prod
RUN npm ci
COPY . .
EXPOSE 5000
ENV NODE_ENV production
RUN npm run build
CMD ["npm", "run", "start:prod"]
