import AWS from 'aws-sdk';

/*  I don't know why this needs to be here. It's also in api/index.js 
    but somehow the env vars don't get set there before some of the 
    service files try to access them.
*/
import dotenv from 'dotenv';
dotenv.config();

/* ---- AWS Config Update ---- */
const ENV = process.env.ENV || 'local';

const baseConfig = {
  region: process.env.region,
};

const localConfig = {
  ...baseConfig,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  endpoint: process.env.endpoint,
};

const envConfigMap = {
  local: localConfig,
  prod: baseConfig,
};

const awsConfig = envConfigMap[ENV];
AWS.config.update(awsConfig);
/* ---- End: AWS Config Update ---- */

const DDB = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
export default DDB;
