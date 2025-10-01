#!/bin/bash

export AWS_REGION=ap-south-1
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local


aws dynamodb create-table \
  --cli-input-json file://tables/guest-table.json \
  --endpoint-url http://localhost:8000 \
  --region ap-south-1 \
  --no-cli-pager \
  || echo "GUEST Table already exists"


aws dynamodb create-table \
  --cli-input-json file://tables/devices-table.json \
  --endpoint-url http://localhost:8000 \
  --region ap-south-1 \
  --no-cli-pager \
  || echo "DEVICES Table already exists"

aws dynamodb create-table \
  --cli-input-json file://tables/intents-table.json \
  --endpoint-url http://localhost:8000 \
  --region ap-south-1 \
  --no-cli-pager \
  || echo "INTENTS Table already exists"  

