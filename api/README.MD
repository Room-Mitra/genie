# api

## To run dynamodb locally

1. Make sure there's a `dynamodb-local-data` folder in the directory you're running this command
2. `mkdir -p dynamodb-local-data && chmod -R 777 dynamodb-local-data`

```sh
docker run --rm -p 8000:8000 -v ./dynamodb-local-data:/home/dynamodblocal/data amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data
```

## To run `dynamodb-admin` web console to view local dynamodb

1. Install it first with `npm install -g dynamodb-admin`

```sh
AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin
```

## Create tables on `dynamodb-admin`

1. Table schemas are under `api/tables`
2. Create all tables in the web console

## Seed data

### GUESTS

```json
{
  "id": "LOGIN:Room Genie:chai",
  "hotelId": "Room Genie",
  "password": "$2b$10$haEIYUY8wEh5Ft526BkttOy66x4JM3nKd106F8Mmc4GeyqQMHSkx2",
  "username": "chai"
}
```

## Using local dynamodb when running api

1. In your `.env` file, update the following values for dynamodb config

```sh
# DYNAMO DB CONFIG
accessKeyId=local
secretAccessKey=local
region=ap-south-1
endpoint=http://localhost:8000
```

## Configuring AWS CLI

1. Get Access Key ID and Secret Access Key for an IAM
2. Run this on your terminal to configure `roommitra` profile - `aws configure --profile roommitra`
3. Enter the access key and secret.
4. Anytime you want to use terraform's roommitra IAM, run an `aws` command with `--profile roommitra`.

## Certificate on the EC2

### NOTE: Run this only if EC2 instance was recreated

1. Grab the EC2 instance ID using `terraform show`
2. Create a ssm to the EC2

```
aws ssm start-session --target i-0547ae1ad3fe5c2f1 --profile roommitra
```

3. Run `certbot` to generate certificates

```sh
sudo certbot --nginx -d roommitra.com -d api.roommitra.com -d app.roommitra.com --agree-tos -m chai@roommitra.com --redirect -n
```

4. Backup the certificates to S3

```sh
BUCKET="s3://roommitra-codedeploy/certs"
sudo tar --numeric-owner -C /etc -czf /root/letsencrypt-backup.tgz letsencrypt
sudo aws s3 cp /root/letsencrypt-backup.tgz $BUCKET/letsencrypt-$(date +%F).tgz
sudo aws s3 cp /root/letsencrypt-backup.tgz $BUCKET/letsencrypt-latest.tgz

```

## Deploying new code

- CodeDeploy isn't working right now.
- Until then, we have to copy the code to the EC2 and restart the `pm2` processes.
- Below are the steps for deploying `website`.
- Similar steps need to be followed for `EC2` and `webapp` services.

### Copying files into EC2

1. There's no SSH access to EC2.
2. Sync the files to S3 first

```sh
aws s3 sync ./website s3://roommitra-codedeploy/website --delete \
--exclude "node_modules/*" \
--exclude ".next/*" \
--exclude "*.log" \
--exclude ".git/*"
```

3. Then login to the EC2 using ssm.

```sh
aws ssm start-session --target i-0547ae1ad3fe5c2f1 --profile roommitra
```

4. Sync the files from S3 to EC2

```sh
  aws s3 sync s3://roommitra-codedeploy/website /opt/roommitra/website --delete
```

### Build

```sh
cd /opt/roommitra/website
npm install
npm run build
```

### Restart `pm2` process

1. Stop and delete `website`

```sh
sudo runuser -l appuser -c "pm2 delete website || true"
```

2. Start

```sh
sudo runuser -l appuser -c "cd /opt/roommitra/website && pm2 start 'PORT=3000 npm run start' --name website || true"
```
