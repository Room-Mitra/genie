
import { useEffect, useState } from "react";
import { httpGet } from "../../../../Services/APIService";
import DataTable from "../../../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../../../Constants/Environment.constants";


const Devices = () => {

    const [allDevices, setAllDevices] = useState(null);

    useEffect(() => {
        const devicesPromise = httpGet(EC2_API_ENDPOINT + '/devices');
        devicesPromise.then((devices) => {
            setAllDevices(devices);
            setRowData(devices);
            /*const rowData = devices.map((device) => {
                return {
                    roomId: device.roomId,
                    deviceId: device.deviceId,
                    deviceType: device.deviceType,
                    deviceTags: device.deviceTags,
                    deviceNotes: device.deviceNotes,
                    propertyName: device.propertyName,
                    floor: device.floor,
                    room: device.room,
                    roomTags: device.roomTags,
                    roomNotes: device.roomNotes,
                    registeredAtUTC: device.registeredAtUTC,
                    // roomId: device.roomInfo.roomId,
                    // deviceType: device.deviceInfo.deviceType,
                    // deviceTags: device.deviceInfo.deviceTags,
                    // deviceNotes: device.deviceInfo.details,
                    // roomFloor: device.roomInfo.floor,
                    // roomTags: device.roomInfo.roomTags,
                    // roomNotest: device.roomInfo.details
                }
            })
            setRowData(rowData);*/
        })
    }, []);

    const SaveChangesButtonComponent = (props) => {
        return <button onClick={(x) => console.log(props, x)}>Save Changes</button>;
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Room ID", field: "roomId", filter: true, editable: true },
        { headerName: "Device Type", field: "deviceType", filter: true, editable: true },
        { headerName: "Device Tags", field: "deviceTags", filter: true, editable: true },
        { headerName: "Property Name", field: "propertyName", filter: true, editable: true },
        { headerName: "Room in Floor", field: "roomFloor", filter: true, editable: true },
        { headerName: "Room Tags", field: "roomTags", filter: true, editable: true },
        { headerName: "Room Notes", field: "roomNotest", filter: true, editable: true },
        { headerName: "Device Notes", field: "deviceNotes", filter: true, editable: true },
        { headerName: "Device ID", field: "deviceId" },
        { headerName: " ", cellRenderer: SaveChangesButtonComponent }
    ]);

    if (!allDevices) {
        return (<div>Loading Devices...</div>); // TODO :: add loader
    }

    return (
        <div>
            <h1>Devices</h1>
            <div style={{ height: 500 }}>
                <DataTable
                    rowData={rowData}
                    columnDefs={colDefs}
                />
            </div>
        </div>
    );
}

export default Devices;