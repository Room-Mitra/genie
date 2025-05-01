const { GUEST_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const ID_TYPE = "BOOKING:";

const addIdType = (booking) => {
    booking.id = `${ID_TYPE}${booking.id}`;
    return booking;
}

const removeIdType = (booking) => {
    booking.id = booking.id.slice(ID_TYPE.length);
    return booking;
}

const addBooking = async (bookingData) => {
    const params = {
        TableName: GUEST_TABLE_NAME,
        Item: { ...addIdType(bookingData) },

    };
    await DDB.put(params).promise();// TODO :: Handle Error
    // console.log("********GUEST ADDED*******", params)
    return params.Item;
}

module.exports = {
    addBooking
};