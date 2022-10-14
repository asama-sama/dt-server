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