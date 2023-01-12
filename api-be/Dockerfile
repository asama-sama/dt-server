 # syntax=docker/dockerfile:1
 FROM node:18-alpine AS api-be
 WORKDIR /app
 COPY app/package.json app/package-lock.json ./
 RUN npm install 
 COPY app/. .
 EXPOSE 3000
 CMD ["npm", "run", "serve"]
