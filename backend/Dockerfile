FROM node:24-alpine3.22
ENV NODE_ENV=production

WORKDIR /app
COPY . .

RUN npm ci

CMD ["node", "./bin/www.js"]