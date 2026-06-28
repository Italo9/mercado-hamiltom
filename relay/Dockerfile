FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --omit=dev
COPY server.js .
RUN mkdir -p .whatsapp-auth && chown -R node:node .whatsapp-auth
USER node
EXPOSE 4000
CMD ["node", "server.js"]
