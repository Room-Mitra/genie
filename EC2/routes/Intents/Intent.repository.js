const { INTENTS_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const addIntent = async (intent) => {
    const params = {
        TableName: INTENTS_TABLE_NAME,
        Item: { ...intent },

    };

    await DDB.put(params).promise();// TODO :: Handle Error
    return params.Item;
};

const getIntentsForDate = async (dateAsInteger) => {
    const params = {
        TableName: INTENTS_TABLE_NAME,
        ExpressionAttributeValues: {
            ":daysSinceEpoch": dateAsInteger
        },
        KeyConditionExpression: "daysSinceEpoch=:daysSinceEpoch"

    };


    const intents = await DDB.query(params).promise();// TODO :: Handle Error
    console.log(intents);
    return intents.Items;
}


module.exports = {
    addIntent, getIntentsForDate
};