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

const DDB = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

export default DDB;
