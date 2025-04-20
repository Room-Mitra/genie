class Intent {
    constructor(deviceId, intentName, isFree = true, status = "Requested", intentTags = "", personalization = "", assignedTo = "", roomId = null) {
        this.daysSinceEpoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) //PK

        this.deviceId = deviceId;

        this.roomId = roomId;
        this.roomTags = null;
        this.roomNotes = null;
        this.propertyName = null;
        this.floor = null;

        this.intentName = intentName;
        this.intentType = getIntentType(intentName);
        this.isFree = isFree;
        this.intentTags = intentTags;

        this.personalization = personalization;

        this.assignedTo = assignedTo;

        this.status = status; // Requested, In Progress, Completed, Not Applicable 
        this.requestedTime = Date.now(); //SK
        this.inProgressTime = null;
        this.completedTime = null;
    }
}

Intent.INTENT_NAMES = {
    DENTAL_KIT: "Dental Kit",
    TOILETRIES: "Toiletries",
    ROOM_CLEAN: "Room Clean",
    BEDDING: "Bedding",
    TOWELS: "Towels"
}

Intent.INTENT_TYPES = {
    "House Keeping": [
        Intent.INTENT_NAMES.DENTAL_KIT,
        Intent.INTENT_NAMES.TOILETRIES,
        Intent.INTENT_NAMES.ROOM_CLEAN,
        Intent.INTENT_NAMES.BEDDING,
        Intent.INTENT_NAMES.TOWELS
    ]
}

const getIntentType = (intentName) => {
    for (let key in Intent.INTENT_TYPES) {
        if (Intent.INTENT_TYPES[key].includes(intentName)) {
            return key;
        }
    }
    return "Other"
}



module.exports = Intent;
