const { GUEST_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const ID_TYPE = "GUEST:";

const addIdType = (guest) => {
    guest.id = `${ID_TYPE}${guest.id}`;
    return guest;
}

const removeIdType = (guest) => {
    guest.id = guest.id.slice(ID_TYPE.length);
    return guest;
}

const addGuest = async (guest) => {
    const params = {
        TableName: GUEST_TABLE_NAME,
        Item: { ...addIdType(guest) },

    };
    await DDB.put(params).promise();// TODO :: Handle Error
    // console.log("********GUEST ADDED*******", params)
    return params.Item;
};

const getGuest = async (guestId) => {
    const params = {
        TableName: GUEST_TABLE_NAME,
        ExpressionAttributeValues: {
            ":id": `${ID_TYPE}${guestId}`
        },
        KeyConditionExpression: "id=:id"
    };
    const guestData = await DDB.query(params).promise();// TODO :: Handle Error
    console.log("Guest Data From DB :: ", guestData, params);
    if (guestData && guestData.Items && guestData.Items.length) {
        return { ...removeIdType(guestData.Items[0]) };
    }
    return { "guestData": null };
}

const updateGuest = async (guestId, guestData) => {
    const params = {
        TableName: GUEST_TABLE_NAME,
        Item: { ...addIdType(guestData) },

    };

    await DDB.put(params).promise(); // TODO :: Handle Error
    return params.Item;
}



module.exports = {
    addGuest, getGuest, updateGuest
};