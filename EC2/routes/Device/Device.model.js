export class Device {
    constructor(id, roomId, deviceType = defaultDeviceType, location = defaultLocation, deviceTags = defaultDeviceTags) {
        this.id = id;
        this.roomId = roomId;
        this.deviceType = deviceType;
        this.location = location;
        this.deviceTags = deviceTags;
    }
}

const defaultDeviceType = "";

const defaultLocation = {
    propertyName: "",
    floor: "",
    room: "",
    roomTags: []
}

const defaultDeviceTags = [];

