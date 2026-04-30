FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server server/
COPY src src/
COPY admin admin/
COPY index.html index.html
COPY main.js main.js
COPY app-config.js app-config.js
COPY design_tokens.json design_tokens.json
COPY design_system.md design_system.md

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/index.js"]