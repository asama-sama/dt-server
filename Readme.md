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
```

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

# Creating Docker image for production from development machine

## Build dockerfile

>docker buildx build -t aqureshimon/dt-server:`<version>` -f Dockerfile.prod .

For MacOS, add this flag
> --platform=linux/amd64

## Push to registry

> docker push aqureshimon/dt-server:`<version>`

# Production machine

## Download the docker image

> docker pull aqureshimon/dt-server:`<version>`

## Database setup

Postgres must be installed locally on the machine 
* `listen_adresses = '*'` should be set in `postgresql.conf`
*  The following line should be added in `pg_hba.conf` 
> `host    all             all             172.17.0.0/16           md5`

## Env file

A .env file should be created with the following values set

```
DB_NAME=<dbname>
DB_USER=<dbuser>
DB_PASSWORD=<dbpassword>
DB_HOST=host.docker.internal
DB_PORT=5432
DATA_FILES_PATH=/dataFiles
DROP_TABLES=no
NOMINATIM_API_TIMEOUT=1500
FETCH_SUBURBS=yes
```

## Create DATA_FILES directory

Create a folder for the location of `DATA_FILES` as listed above. If using the same directory, run 
> `mkdir ~/dataFiles`

## Docker run command

> docker run --mount type=bind,source=/home/ubuntu/dataFiles,target=/dataFiles --env-file .env --add-host=host.docker.internal:host-gateway  aqureshimon/dt-server:`<version>`

Save this command in a bash script for reuse