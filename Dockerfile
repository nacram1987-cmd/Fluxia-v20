FROM node:22-alpine
WORKDIR /app
COPY server.js package.json ./
COPY public ./public
ENV PORT=8787
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "server.js"]
