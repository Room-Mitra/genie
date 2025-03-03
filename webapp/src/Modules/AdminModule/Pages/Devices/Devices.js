
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
            const rowData = devices.map((device) => {
                return {
                    roomId: device.roomId,
                    deviceId: device.deviceId,
                    deviceType: device.deviceInfo.deviceType,
                    deviceTags: device.deviceInfo.deviceTags,
                    roomFloor: device.roomInfo.floor,
                    roomTags: device.roomInfo.roomTags
                }
            })
            setRowData(rowData);
        })
    }, []);

    const CustomButtonComponent = (props) => {
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
        { headerName: "Device ID", field: "deviceId" },
        { headerName: " ", cellRenderer: CustomButtonComponent }
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