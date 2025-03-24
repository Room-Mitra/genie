
import { useEffect, useState } from "react";
import { httpGet, httpPut } from "../../Services/APIService";
import DataTable from "../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { getDaysSinceEpoch } from "../../Services/Common.service";

const INTENTS_API_URI = '/intents';

const Intents = () => {

    const [allIntents, setAllIntents] = useState(null);
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);
    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        // { headerName: "Requested Time", field: "requestedTime", filter: true, editable: true },
        { headerName: "Requested Date", valueGetter: p => new Date(p.data.requestedTime).toLocaleDateString(), filter: true },
        { headerName: "Requested Time", valueGetter: p => new Date(p.data.requestedTime).toLocaleTimeString(), filter: true },
        { headerName: "Intent Name", field: "intentName", filter: true, editable: true },
        { headerName: "Intent Type", field: "intentType", filter: true, editable: true },
        { headerName: "Room ID", field: "roomId", filter: true, editable: false },
        { headerName: "In Progress Time", valueGetter: p => p.data.inProgressTime ? new Date(p.data.inProgressTime).toLocaleTimeString() : "-", filter: true },
        { headerName: "Completed Time", valueGetter: p => p.data.completedTime ? new Date(p.data.completedTime).toLocaleTimeString() : "-", filter: true },
        { headerName: "Assigned To", field: "assignedTo", filter: true, editable: true },
        // { headerName: "Property Name", field: "propertyName", filter: true, editable: true },
        // { headerName: "Room in Floor", field: "roomFloor", filter: true, editable: true, cellDataType: 'number' },
        // { headerName: "Room Notes", field: "roomNotest", filter: true, editable: true },
        // { headerName: "Device Notes", field: "deviceNotes", filter: true, editable: true },
        // { headerName: "Device ID", field: "deviceId" },
        // { headerName: "Device Registered On", valueGetter: p => new Date(p.data.registeredAtUTC).toLocaleString(), filter: "agDateColumnFilter" },
        // { headerName: " ", cellRenderer: SaveChangesButtonComponent }
    ]);

    useEffect(() => {
        getAllIntentsData()
    }, []);

    const getAllIntentsData = async () => {
        const intentsApiResponse = await httpGet(EC2_API_ENDPOINT + INTENTS_API_URI + "/" + getDaysSinceEpoch(+Date.now()) + "?range=2", true);
        const intents = [];
        Object.keys(intentsApiResponse).forEach(daysSinceEpoch => {
            intents.push(...intentsApiResponse[daysSinceEpoch]);
        })
        intents.sort((a, b) => b.requestedTime - a.requestedTime);
        console.log("Intents = ", intents)
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

    return (
        <div>
            <h1>Intents</h1>
            {allIntents && (
                <div style={{ height: 500 }}>
                    <DataTable
                        rowData={rowData}
                        columnDefs={colDefs}
                    />
                </div>
            )}
            {!allIntents && (<div>Loading Intents...</div>)}
        </div>
    );
}

export default Intents;