import { useEffect, useState } from "react";
import { httpGet, httpPut } from "../../Services/APIService";
import DataTable from "../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { getDaysSinceEpoch } from "../../Services/Common.service";

const INTENTS_API_URI = 'path=/intents';

const Intents = () => {

    const [allIntents, setAllIntents] = useState(null);
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);
    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Date", valueGetter: p => new Date(p.data.requestedTime).toLocaleDateString(), filter: true, width: 110 },
        { headerName: "Time", valueGetter: p => new Date(p.data.requestedTime).toLocaleTimeString(), filter: true, width: 110 },
        { headerName: "Name", field: "intentName", filter: true, editable: true },
        { headerName: "Type", field: "intentType", filter: true, editable: true },
        { headerName: "Room", field: "roomId", filter: true, editable: false, width: 110 },
        { headerName: "In Progress Time", valueGetter: p => p.data.inProgressTime ? new Date(p.data.inProgressTime).toLocaleTimeString() : "-", filter: true },
        { headerName: "Completed Time", valueGetter: p => p.data.completedTime ? new Date(p.data.completedTime).toLocaleTimeString() : "-", filter: true },
        { headerName: "Assigned To", field: "assignedTo", filter: true, editable: true },
    ]);

    useEffect(() => {
        getAllIntentsData()
    }, []);

    const getAllIntentsData = async () => {
        const intentsApiResponse = await httpGet('/api/proxy' + INTENTS_API_URI + "/" + getDaysSinceEpoch(+Date.now()) + "?range=2", true);
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
            alert("Data updated")
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
            }}>REQUESTS</h1>
            {allIntents && (
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
            )}
            {!allIntents && (
                <div style={{
                    textAlign: "center",
                    color: "#777",
                    fontSize: "16px",
                    marginTop: "20px"
                }}>Loading Intents...</div>
            )}
        </div>
    );
}

export default Intents;