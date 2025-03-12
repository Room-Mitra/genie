class Device {
    constructor(deviceId, roomId) {
        this.deviceId = deviceId;
        this.roomId = roomId;
        this.propertyName = defaultRoomInfo.propertyName;
        this.floor = defaultRoomInfo.floor;
        // this.room = defaultRoomInfo.room;
        this.roomTags = defaultRoomInfo.roomTags;
        this.roomNotes = defaultRoomInfo.notes;
        this.deviceType = defaultDeviceInfo.deviceType;
        this.deviceTags = defaultDeviceInfo.deviceTags;
        this.deviceNotes = defaultDeviceInfo.notes;
        this.registeredAtUTC = new Date().toISOString();
    }
}


const defaultRoomInfo = {
    propertyName: "", // Vivanta Chennai
    floor: "", // 5
    room: "", // 504
    roomTags: "", // SeaView, Deluxe
    notes: ""
}

const defaultDeviceInfo = {
    deviceType: "",
    deviceTags: "", // video
    notes: ""
}

module.exports = Device;