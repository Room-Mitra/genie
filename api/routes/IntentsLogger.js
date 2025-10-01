// import express from 'express';
// const router = express.Router();

// const IntentLog = [
//     {
//         timeStamp: "TIMESTAMP", //PK
//         roomId: "301",//SK?
//         intentName: "SPA_TIMINGS",
//         intentTags: ["Paid/Free", "Informational", "Dining", "By_Employees"],
//         currentGuestDetails: {
//             guestName: "GUEST_NAME",
//             guestEmail: "GUEST_EMAIL",
//             guestPhoneNumber: "GUEST_PHONE_NUMBER",
//             guestType: "GUEST_TYPE",
//             guestTags: ["Gold Member"]
//         },
//         response: {}
//     }
// ]

// get logs since {timestamp} - limit timestamp as it may cause memory overflow or use pagination
// get all intents of room since {timestamp} + filter by tags
// get all tags - to show in front end
// fetch all intents of type {x}
// get all intents with tags