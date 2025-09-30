# EC2

## To run dynamodb locally
1. Make sure there's a `dynamodb-local-data` folder in the directory you're running this command
2. ```mkdir -p dynamodb-local-data && chmod -R 777 dynamodb-local-data```
```sh
docker run --rm -p 8000:8000 -v ./dynamodb-local-data:/home/dynamodblocal/data amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data
```


## To run `dynamodb-admin` web console to view local dynamodb
1. Install it first with `npm install -g dynamodb-admin`
```sh
AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin
```

## Create tables on `dynamodb-admin`
1. Table schemas are under `EC2/tables`
2. Create all tables in the web console

## Seed data 

### GUESTS
```json
{
  "id":  "LOGIN:Room Genie:chai",
  "hotelId": "Room Genie",
  "password": "$2b$10$haEIYUY8wEh5Ft526BkttOy66x4JM3nKd106F8Mmc4GeyqQMHSkx2",
  "username": "chai"
  
}
```


## Using local dynamodb when running EC2
1. In your `.env` file, update the following values for dynamodb config
```sh
# DYNAMO DB CONFIG
accessKeyId=local
secretAccessKey=local
region=ap-south-1
endpoint=http://localhost:8000
```


## Certificate on the EC2
Run this if EC2 instance was recreated 
```sh
sudo certbot --nginx -d roommitra.com -d api.roommitra.com -d app.roommitra.com --agree-tos -m chai@roommitra.com --redirect -n
```