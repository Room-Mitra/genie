import AWS from 'aws-sdk';
import {
  GUEST_TABLE_NAME,
  INTENTS_TABLE_NAME,
  DEVICES_TABLE_NAME,
} from '../Constants/DB.constants.js';

import dotenv from 'dotenv';
dotenv.config();

const ENV = process.env.ENV || 'local';

const baseConfig = {
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
};

const localConfig = {
  ...baseConfig,
  endpoint: process.env.endpoint || 'http://localhost:8000',
};

const envConfigMap = {
  local: localConfig,
  stage: baseConfig,
  prod: baseConfig,
};

const awsConfig = envConfigMap[ENV];
AWS.config.update(awsConfig);

console.log(awsConfig);

if (ENV === 'local') {
  const dynamodb = new AWS.DynamoDB(awsConfig);

  const guestTableParams = {
    TableName: GUEST_TABLE_NAME,
    KeySchema: [{ AttributeName: 'id', KeyType: 'STRING' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  };

  dynamodb.createTable(guestTableParams, function (err, data) {
    if (err && err.code !== 'ResourceInUseException') {
      console.error('Unable to create GUEST table:', err);
    } else {
      console.log('GUEST table created or already exists.');
    }
  });

  const intentsTableParams = {
    TableName: INTENTS_TABLE_NAME,
    KeySchema: [{ AttributeName: 'daysSinceEpoch', KeyType: 'STRING' }],
    AttributeDefinitions: [{ AttributeName: 'daysSinceEpoch', AttributeType: 'N' }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  };

  dynamodb.createTable(intentsTableParams, function (err, data) {
    if (err && err.code !== 'ResourceInUseException') {
      console.error('Unable to create INTENTS table:', err);
    } else {
      console.log('INTENTS table created or already exists.');
    }
  });

  const devicesTableParams = {
    TableName: DEVICES_TABLE_NAME,
    KeySchema: [{ AttributeName: 'deviceId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'deviceId', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  };
  dynamodb.createTable(devicesTableParams, function (err, data) {
    if (err && err.code !== 'ResourceInUseException') {
      console.error('Unable to create DEVICES table:', err);
    } else {
      console.log('DEVICES table created or already exists.');
    }
  });
}

const DDB = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

export default DDB;
