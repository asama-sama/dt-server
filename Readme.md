[About this project](https://asama-sama.github.io/dt-server/)

# How to get this working on your local development machine

* Install docker https://www.docker.com/
> Check that it is installed with `docker-compose -v`

* Create a .env file in `/app` with the following credentials. You can change these if needed.
```
DB_NAME=root
DB_USER=root
DB_PASSWORD=root
DB_HOST=db
DB_PORT=5432
DATA_FILES_PATH=/dataFiles
DROP_TABLES=no
NOMINATIM_API_TIMEOUT=1500
FETCH_SUBURBS=yes
NSW_OPEN_DATA_API_KEY=<opendata api key for traffic incidents. see below for how to set>
```

* Create a .env file in `analysisBackend` with the following:
```
DB_NAME=root
DB_USER=root
DB_PASSWORD=root
DB_HOST=db
DB_PORT=5432
```

* Create an api key for [NSW Open Data](https://opendata.transport.nsw.gov.au/)

* * Create an account at the link above

* * Create a new application for the following APIs

* * * NSW Live Traffic

* * Add this API key to your environment variables for NSW_OPEN_DATA_API_KEY

* Run `npm i`

* Run the docker files from the root project directory `/`
> docker-compose up

# How to access the database

## Using adminer 
Adminer is running in a docker container. To browser the database, open your browser and navigate to `localhost:8080`. Enter the database credentials (used for the .env file above)

## From your local machine
Use the credentials above for the database host, use `localhost` and `5433` for the port.

# Loading CSV files

Certain csv files may be imported and loaded into the database. These files must be of a specific format. Currently accepted files are

* [Sydney Greenhouse Gas Emissions By Suburb](https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::greenhouse-gas-emissions-profile-by-suburb-1/explore?location=-33.888930%2C151.203975%2C13.97)

* [NSW Crime Data by Suburb](https://www.bocsar.nsw.gov.au/Pages/bocsar_datasets/Offence.aspx)

To load the CSV file into the database, the following steps should be taken

* create a directory called `dataFiles` in the root project directory

* place the csv file you would like to be read in this directory

* create an entry in the `DataFiles` table to tell the app to process this file

* * Go to adminer, on localhost:8080 in your browser and log in with your DB credentials

* * Click on the `DataFiles` table

* * Click `Add new item` with the following properties

```
id: leave this blank
dataSourceId: This should be the primary key from "DataSources" matching the type of file you are trying to upload
name: this should match the name of the csv file
processed: leave this blank
processedOn: leave this blank
createdAt: NOW()
updatedAt: NOW()
```

* * Now restart the app and the file uploading should appear in the logs. When it is complete, the `processed` column for your new entry should be set to true

 To update through an SQL statement,
>
>insert into "DataFiles" ("dataSourceId", "name", "createdAt", "updatedAt") values (6, 'ghgemissions.csv', NOW(), NOW());

# Creating a new Docker image for production from development machine 

Follow these steps to update the docker image on docker hub (or some other registry)

## Build dockerfile

* **api backend**

From `/api-be`, run:

>docker buildx build -t aykyu/dt-server:`<version>` -f Dockerfile.prod .

If building on MacOS, add this flag
> --platform=linux/amd64

* **analysis backend**

From `/analysisBackend`, run:

>docker buildx build -t aykyu/
dt-anlys-be:`<version>` .

If building on MacOS, add this flag
> --platform=linux/amd64

## Push to registry

* Push the api backend

> docker push aykyu/dt-server:`<version>`

* Push the analysis  backend

> docker push aykyu/dt-anlys-be:`<version>`

# Production machine

## Install Docker and download the docker image

* Install Docker on the production server

* Pull the Docker image for the api backend

> docker pull aykyu/dt-server:`<version>`

* Pull the Docker image for the analysis backend

> docker pull aykyu/dt-anlys-be:`version`

## Create a network

> docker network create mynet

## Database setup

Download and run the postGIS container

> docker run --net mynet --name dblocal -e POSTGRES_PASSWORD=`<password>` -d -p 5432:5432 postgis/postgis:14-3.3-alpine

## Env files

* Create directory for analysis backend

> mkdir `~/dt-anlys-be-config`
>
> cd `dt-anlys-be-config`

* Create an .env file with the following variables in this directory

```
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=dblocal
DB_PORT=5432
```

* Create a project directory for the api backend

> mkdir `~/dt-api-be-config`

* Create a `.env` file in this directory

> cd `~/dt-api-be-config`

> touch `.env`

Set the following values in `.env`

```
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=dblocal
DB_PORT=5432
DATA_FILES_PATH=/dataFiles
DROP_TABLES=no
NOMINATIM_API_TIMEOUT=1500
FETCH_SUBURBS=yes
```

## Create DATA_FILES directory

Create a folder for the location of `DATA_FILES`.

> `mkdir dataFiles`

## Add user to group 'docker'

Run the following commands

* `sudo usermod -a -G docker [<your current user>]`
* `newgrp docker`


## Docker run command for api backend

> docker run -d --net mynet --mount type=bind,source=/home/ubuntu/dt-api-be-config/dataFiles,target=/dataFiles -p 3000:3000 --name api-be --env-file .env --add-host=host.docker.internal:host-gateway  aykyu/dt-server:`<version>`

## Docker run command for analysis backend

> cd ~/dt-anlys-be-config
>
> docker run -d --net mynet -p 3200:3200 --name dt-anlys-be --env-file .env aykyu/dt-anlys-be:`<version>`
