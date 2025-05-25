const { GUEST_TABLE_NAME: USER_LOGIN_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const getUser = async (userId) => {
    const params = {
        TableName: USER_LOGIN_TABLE_NAME,
        ExpressionAttributeValues: {
            ":id": `${userId}`
        },
        KeyConditionExpression: "id=:id"
    };
    try {
        console.info("Accessing Login details from DB with params", params);
        const userData = await DDB.query(params).promise();
        console.info("User Data From DB :: ", userData, " :: for input params ::", params);
        if (userData && userData.Items && userData.Items.length) {
            return { ...userData.Items[0] };
        }
    } catch (e) {
        console.error("Error while accessing login details from DB", e, " :: for input params ::", params);
    }
    return null;
}

const addUser = async (userData) => {
    console.info("Attempting to add user to Login DB :: ", userData);
    const params = {
        TableName: USER_LOGIN_TABLE_NAME,
        Item: { ...userData },

    };
    try {
        await DDB.put(params).promise();
        console.info("USER ADDED :: ", params)
        return params.Item;
    } catch (e) {
        console.error("Failed to add user. Error :: ", e, " :: for input params ::", params);
    }
    return null;
};

module.exports = {
    getUser, addUser
};