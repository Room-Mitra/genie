const { GUEST_TABLE_NAME: FAQ_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const ID_TYPE = "FAQ:";

const addIdType = (faq) => {
    faq.id = `${ID_TYPE}${faq.hotelId}`;
    return faq;
}

const removeIdType = (guest) => {
    guest.id = guest.id.slice(ID_TYPE.length);
    return guest;
}

const addFAQ = async (faq) => {
    const params = {
        TableName: FAQ_TABLE_NAME,
        Item: { ...addIdType(faq) },

    };
    await DDB.put(params).promise();// TODO :: Handle Error
    console.log("********FAQ ADDED*******", params)
    return params.Item;
};

const getFAQ = async (hotelId) => {
    const params = {
        TableName: FAQ_TABLE_NAME,
        ExpressionAttributeValues: {
            ":id": `${ID_TYPE}${hotelId}`
        },
        KeyConditionExpression: "id=:id"
    };
    const faqData = await DDB.query(params).promise();// TODO :: Handle Error
    console.log("FAQ Data From DB :: ", faqData, params);
    if (faqData && faqData.Items && faqData.Items.length) {
        return { ...removeIdType(faqData.Items[0]) };
    }
    return { "faqData": null };
}

module.exports = { addFAQ, getFAQ }
