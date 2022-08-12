 # syntax=docker/dockerfile:1
 FROM node:18-alpine
 WORKDIR /app
 COPY app/package.json app/package-lock.json ./
 RUN npm install 
 COPY app/. .
 CMD ["npm", "run", "serve"]