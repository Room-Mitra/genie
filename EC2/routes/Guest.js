import express from 'express';
const router = express.Router();

const guests = [
    {
        emailOrPhoneNumber: "GUEST_EMAIL_OR_PHONE_NUMBER", //PK
        name: "GUEST_NAME",
        emaiId: "GUEST_EMAIL_ID",
        phoneNumber: "GUEST_PHONE_NUMBER",
        tags: ["Good tipper", "Rude", "Famous"],
        history: [
            {
                timeStamp: "TIMESTAMP",
                HotelName: "HOTEL_NAME",
                roomType: "ROOM_TYPE",
                intentName: "INTENT_NAME",
                intentTags: ["Paid/Free", "Informational", "Dining", "By_Employees"],
            }
        ]

    }
]