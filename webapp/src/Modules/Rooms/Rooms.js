import DataTable from "../../Common/DataTable/DataTable";
import { useEffect, useState } from "react";
import { httpGet, httpPut } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";

const DEVICES_API_URI = '/devices';

const Rooms = () => {

    const [allDevices, setAllDevices] = useState(null);

    useEffect(() => {
        getAllRoomsData()
    }, []);

    const getAllRoomsData = async () => {
        const rooms = await httpGet(EC2_API_ENDPOINT + DEVICES_API_URI);
        rooms.sort((b, a) => b.roomId - a.roomId);
        setAllDevices(rooms);
        setRowData(rooms);
    }

    const SaveChangesButtonComponent = (rowInfo) => {

        const handleClick = async (rowInfo, eventObj) => {
            await httpPut(EC2_API_ENDPOINT + DEVICES_API_URI, [rowInfo.data])
            getAllRoomsData();
            alert("Data updated")
        }

        return <button onClick={(eventObj) => handleClick(rowInfo, eventObj)}>Save Changes</button>;
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Room ID", field: "roomId", filter: true, editable: true },
        // { headerName: "Device Type", field: "deviceType", filter: true, editable: true },
        // { headerName: "Device Tags", field: "deviceTags", filter: true, editable: true },
        { headerName: "Property Name", field: "propertyName", filter: true, editable: true },
        { headerName: "Room in Floor", field: "roomFloor", filter: true, editable: true, cellDataType: 'number' },
        { headerName: "Room Tags", field: "roomTags", filter: true, editable: true },
        { headerName: "Current Booking", valueGetter: p => p.data.currentBooking ? p.data.currentBooking : "-", filter: true, editable: false },
        { headerName: "Room Notes", field: "roomNotest", filter: true, editable: true },
        // { headerName: "Device Notes", field: "deviceNotes", filter: true, editable: true },
        { headerName: "Device ID", field: "deviceId" },
        // { headerName: "Device Registered On", valueGetter: p => new Date(p.data.registeredAtUTC).toLocaleString(), filter: "agDateColumnFilter" },
        { headerName: " ", cellRenderer: SaveChangesButtonComponent }
    ]);

    if (!allDevices) {
        return (<div>Loading Devices...</div>); // TODO :: add loader
    }

    return (<>
        <h1> Rooms Info</h1>
        <div style={{ height: 500 }}>
            <DataTable
                rowData={rowData}
                columnDefs={colDefs}
            />
        </div>
    </>)
}

export default Rooms;