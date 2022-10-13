# Development machine

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