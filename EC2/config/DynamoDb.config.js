var AWS = require('aws-sdk');
const {
    GUEST_TABLE_NAME,
    INTENTS_TABLE_NAME,
    DEVICES_TABLE_NAME,
} = require("../Constants/DB.constants.js");


const ENV = process.env.ENV || 'local';

const baseConfig = {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region,
};

const localConfig = {
    ...baseConfig,
    endpoint: process.env.AWS_ENDPOINT || 'http://localhost:8000',
};

const envConfigMap = {
    local: localConfig,
    stage: baseConfig,
    prod: baseConfig,
};


const awsConfig = envConfigMap[ENV];
AWS.config.update(awsConfig);

const DDB = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

module.exports = DDB;
