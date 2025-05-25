class Intent {
    constructor(deviceId, intentName, cost = 0, status = "Requested", intentTags = "", personalization = "", assignedTo = "", roomId = null) {
        this.daysSinceEpoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) //PK

        this.deviceId = deviceId;

        this.roomId = roomId;
        this.roomTags = null;
        this.roomNotes = null;
        this.propertyName = null;
        this.floor = null;

        this.intentName = getIntentDisplayName(intentName);
        this.intentType = getIntentType(intentName);
        this.cost = cost;
        this.intentTags = intentTags;

        this.personalization = personalization;

        this.assignedTo = assignedTo;

        this.status = status; // Requested, In Progress, Completed, Not Applicable 
        this.requestedTime = Date.now(); //SK
        this.inProgressTime = null;
        this.completedTime = null;

        console.log("Intent :: ", this)
    }
}

Intent.INTENT_NAMES = {
    DENTAL_KIT: "HouseKeepingDentalKitIntent",
    TOILETRIES: "HouseKeepingToiletriesIntent",
    ROOM_CLEAN: "HouseKeepingRoomCleanIntent",
    BEDDING: "HouseKeepingBeddingIntent",
    TOWELS: "HouseKeepingTowelsIntent",
    LAUNDRY: "HouseKeepingLaundryIntent",
    IRON_BOX: "HouseKeepingIronBoxIntent",
    ICE_CUBES: "HouseKeepingIceCubesIntent",
    SHOE_SHINE_KIT: "HouseKeepingShoeShineKitIntent"
}


Intent.INTENT_TYPES = {
    "House Keeping": [
        Intent.INTENT_NAMES.DENTAL_KIT,
        Intent.INTENT_NAMES.TOILETRIES,
        Intent.INTENT_NAMES.ROOM_CLEAN,
        Intent.INTENT_NAMES.BEDDING,
        Intent.INTENT_NAMES.TOWELS,
        Intent.INTENT_NAMES.LAUNDRY,
        Intent.INTENT_NAMES.IRON_BOX,
        Intent.INTENT_NAMES.ICE_CUBES,
        Intent.INTENT_NAMES.SHOE_SHINE_KIT
    ]
}

Intent.speechText = {
    [Intent.INTENT_NAMES.DENTAL_KIT]: "HouseKeepingDentalKitHandlerConfirmRequest",
    [Intent.INTENT_NAMES.TOILETRIES]: "HouseKeepingToiletriesHandlerConfirmRequest",
    [Intent.INTENT_NAMES.ROOM_CLEAN]: "HouseKeepingRoomCleanHandlerConfirmRequest",
    [Intent.INTENT_NAMES.BEDDING]: "HouseKeepingBeddingHandlerConfirmRequest",
    [Intent.INTENT_NAMES.TOWELS]: "HouseKeepingTowelsHandlerConfirmRequest",
    [Intent.INTENT_NAMES.LAUNDRY]: "HouseKeepingLaundryHandlerConfirmRequest",
    [Intent.INTENT_NAMES.IRON_BOX]: "HouseKeepingIronBoxHandlerConfirmRequest",
    [Intent.INTENT_NAMES.ICE_CUBES]: "HouseKeepingIceCubesHandlerConfirmRequest",
    [Intent.INTENT_NAMES.SHOE_SHINE_KIT]: "HouseKeepingShoeShineKitHandlerConfirmRequest"
}

const getIntentType = (intentName) => {
    for (let key in Intent.INTENT_TYPES) {
        if (Intent.INTENT_TYPES[key].includes(intentName)) {
            return key;
        }
    }
    return "Other"
}


const getIntentDisplayName = (intentName) => {
    for (let key in Intent.INTENT_NAMES) {
        if (Intent.INTENT_NAMES[key] === intentName) {
            return key;
        }
    }
    return "Other"
}





module.exports = Intent;
