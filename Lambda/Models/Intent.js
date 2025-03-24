class Intent {
    constructor(deviceId, intentName, isFree, status = "Requested", intentTags = "", personalization = "", assignedTo = "", roomId = null) {
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
        this.InProgressTime = null;
        this.completedTime = null;
    }
}

Intent.INTENT_NAMES = {
    DENTAL_KIT: "Dental Kit"
}

Intent.INTENT_TYPES = {
    "House Keeping": [
        Intent.INTENT_NAMES.DENTAL_KIT
    ]
}

const getIntentType = (intentName) => {
    Object.keys(Intent.INTENT_TYPES).forEach(key => {
        if (Intent.INTENT_TYPES[key].includes(intentName)) {
            return key;
        }
    })
    return "Other"
}



module.exports = Intent;
