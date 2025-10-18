import AWS from 'aws-sdk';

import dotenv from 'dotenv';
dotenv.config();

const ENV = process.env.ENV || 'local';

const baseConfig = {
  region: process.env.region,
};

const localConfig = {
  ...baseConfig,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  endpoint: process.env.endpoint || 'http://localhost:8000',
};

const envConfigMap = {
  local: localConfig,
  prod: baseConfig,
};

const awsConfig = envConfigMap[ENV];
AWS.config.update(awsConfig);

const DDB = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

export default DDB;
