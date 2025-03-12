
import { useEffect, useState } from "react";
import { httpGet, httpPut } from "../../Services/APIService";
import DataTable from "../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";

const INTENTS_API_URI = '/intents';

const Intents = () => {

    const [allIntents, setAllIntents] = useState(null);

    useEffect(() => {
        getAllIntentsData()
    }, []);

    const getAllIntentsData = async () => {
        const intents = await httpGet(EC2_API_ENDPOINT + INTENTS_API_URI + "/" + Math.floor(Date.now() / (24 * 60 * 60 * 1000)));
        console.log("Intents for Today = ", intents)
        setAllIntents(intents);
        setRowData(intents);
    }

    const SaveChangesButtonComponent = (rowInfo) => {

        const handleClick = async (rowInfo, eventObj) => {
            // await httpPut(EC2_API_ENDPOINT + INTENTS_API_URI, [rowInfo.data])
            // getAllIntentsData();
            alert("Data updated")
        }

        return <button onClick={(eventObj) => handleClick(rowInfo, eventObj)}>Save Changes</button>;
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Requested Time", field: "requestedTime", filter: true, editable: true },
        { headerName: "Room ID", field: "roomId", filter: true, editable: false },
        { headerName: "Intent Name", field: "intentName", filter: true, editable: true },
        // { headerName: "Property Name", field: "propertyName", filter: true, editable: true },
        // { headerName: "Room in Floor", field: "roomFloor", filter: true, editable: true, cellDataType: 'number' },
        // { headerName: "Room Tags", field: "roomTags", filter: true, editable: true },
        // { headerName: "Room Notes", field: "roomNotest", filter: true, editable: true },
        // { headerName: "Device Notes", field: "deviceNotes", filter: true, editable: true },
        // { headerName: "Device ID", field: "deviceId" },
        // { headerName: "Device Registered On", valueGetter: p => new Date(p.data.registeredAtUTC).toLocaleString(), filter: "agDateColumnFilter" },
        // { headerName: " ", cellRenderer: SaveChangesButtonComponent }
    ]);

    if (!allIntents) {
        return (<div>Loading Intents...</div>); // TODO :: add loader
    }

    return (
        <div>
            <h1>Intents</h1>
            <div style={{ height: 500 }}>
                <DataTable
                    rowData={rowData}
                    columnDefs={colDefs}
                />
            </div>
        </div>
    );
}

export default Intents;