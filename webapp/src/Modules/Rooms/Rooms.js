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
        const rooms = await httpGet(EC2_API_ENDPOINT + DEVICES_API_URI, true);
        rooms.sort((b, a) => b.roomId - a.roomId);
        setAllDevices(rooms);
        setRowData(rooms);
    }

    const SaveChangesButtonComponent = (rowInfo) => {
        const handleClick = async (rowInfo, eventObj) => {
            await httpPut(EC2_API_ENDPOINT + DEVICES_API_URI, [rowInfo.data])
            getAllRoomsData();
            alert(`Data updated for ${rowInfo.data.roomId}`)
        }

        return <button style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
        }} onClick={(eventObj) => handleClick(rowInfo, eventObj)}>Save Changes</button>;
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Room ID", field: "roomId", filter: true, editable: true },
        { headerName: "Property Name", field: "propertyName", filter: true, editable: true },
        { headerName: "Room in Floor", field: "roomFloor", filter: true, editable: true, cellDataType: 'number' },
        { headerName: "Room Tags", field: "roomTags", filter: true, editable: true },
        { headerName: "Current Booking", valueGetter: p => p.data.currentBooking ? p.data.currentBooking : "-", filter: true, editable: false },
        { headerName: "Room Notes", field: "roomNotest", filter: true, editable: true },
        { headerName: "Device ID", field: "deviceId" },
        { headerName: " ", cellRenderer: SaveChangesButtonComponent }
    ]);

    if (!allDevices) {
        return (
            <div style={{
                textAlign: "center",
                color: "#777",
                fontSize: "16px",
                marginTop: "20px"
            }}>Loading Devices...</div>
        ); // TODO :: add loader
    }

    return (
        <div style={{
            fontFamily: "'Arial', sans-serif",
            margin: "20px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
        }}>
            <h1 style={{
                textAlign: "center",
                color: "#333",
                marginBottom: "20px"
            }}>ROOMS DATA</h1>
            <div style={{
                height: "500px",
                overflow: "auto",
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                padding: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}>
                <DataTable
                    rowData={rowData}
                    columnDefs={colDefs}
                />
            </div>
        </div>
    );
}

export default Rooms;