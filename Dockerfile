 # syntax=docker/dockerfile:1
 FROM node:18-alpine AS api-be
 WORKDIR /app
 COPY app/package.json app/package-lock.json ./
 RUN npm install 
 COPY app/. .
 EXPOSE 3000
 CMD ["npm", "run", "serve"]

FROM ubuntu:kinetic-20221101 AS analysis-be
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive tz=Australia/Sydney
RUN apt-get -y install python3-tk
RUN apt-get -y install libpq-dev python3 \ 
    python3-pip gdal-bin libgdal-dev 
RUN pip install --upgrade cython
RUN pip install --upgrade pip
WORKDIR /analysisBackend
COPY ./analysisBackend .
RUN pip install pipreqs
RUN pipreqs .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 3200
CMD [ "python3", "DT_Backend_Combined_WEB.py" ]