class Device {
    constructor(deviceId, roomId, roomInfo = defaultRoomInfo, deviceInfo = defaultDeviceInfo) {
        this.deviceId = deviceId;
        this.roomId = roomId;
        this.roomInfo = roomInfo;
        this.deviceInfo = deviceInfo;
    }
}


const defaultRoomInfo = {
    propertyName: "", // Vivanta Chennai
    floor: "", // 5
    room: "", // 504
    roomTags: [], // SeaView, Deluxe
    details: {}
}

const defaultDeviceInfo = {
    deviceType: "",
    deviceTags: [], // video
    details: {}
}

module.exports = Device;