class Intent {
    constructor(deviceId, intentName, intentType, isFree, status, intentTags = "", assignedTo = "", roomId = null) {
        this.daysSinceEpoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) //PK

        this.deviceId = deviceId;

        this.roomId = roomId;
        this.roomTags = null;
        this.roomNotes = null;

        this.intentName = intentName;
        this.intentType = intentType;
        this.isFree = isFree;
        this.intentTags = intentTags;

        this.assignedTo = assignedTo;

        this.status = status; // Requested, In Progress, Completed, Not Applicable 
        this.requestedTime = Date.now(); //SK
        this.InProgressTime = null;
        this.completedTime = null;
    }
}
module.exports = Intent;
