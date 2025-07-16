import { useEffect, useState } from "react";
import { httpGet, httpPut } from "../../Services/APIService";
import DataTable from "../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { getDaysSinceEpoch } from "../../Services/Common.service";
// import { useNotification } from "../../Common/Notification/NotificationContext";

const INTENTS_API_URI = '/intents';

const Intents = () => {
    // const { showNotification } = useNotification();
    const [allIntents, setAllIntents] = useState(null);
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(null);


    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState([]);

    const ViewLogButtonComponent = (rowInfo) => {

        const handleClick = (rowInfo, eventObj) => {
            if (rowInfo && rowInfo.data && rowInfo.data.conversationLog && rowInfo.data.conversationLog.history && rowInfo.data.conversationLog.history.length) {
                const data = [];
                rowInfo.data.conversationLog.history.forEach(speech => {
                    if (speech && speech.role) {
                        if (speech.role.toLocaleLowerCase() === "user") {
                            data.push({ key: "Guest", value: speech.content })
                        } else if (speech.role.toLocaleLowerCase() === "assistant") {
                            if (speech.content && JSON.parse(speech.content) && JSON.parse(speech.content).messages && JSON.parse(speech.content).messages.length) {
                                data.push({ key: "RoomMitra", value: JSON.parse(speech.content).messages.join(".") })
                            }
                        }
                    }

                })
                setPopupData(data);
                setIsPopupOpen(true);
            }
        }

        return <button style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
        }} onClick={(eventObj) => handleClick(rowInfo, eventObj)}>View Log</button>;
    };

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { headerName: "Date", valueGetter: p => new Date(p.data.requestedTime).toLocaleDateString(), filter: true, width: 110 },
        { headerName: "Time", valueGetter: p => new Date(p.data.requestedTime).toLocaleTimeString(), filter: true, width: 110 },
        { headerName: "Name", field: "intentName", filter: true, editable: true },
        { headerName: "Type", field: "intentType", filter: true, editable: true },
        { headerName: "Room", field: "roomId", filter: true, editable: false, width: 110 },
        // { headerName: "In Progress Time", valueGetter: p => p.data.inProgressTime ? new Date(p.data.inProgressTime).toLocaleTimeString() : "-", filter: true },
        // { headerName: "Completed Time", valueGetter: p => p.data.completedTime ? new Date(p.data.completedTime).toLocaleTimeString() : "-", filter: true },
        // { headerName: "Assigned To", field: "assignedTo", filter: true, editable: true },
        { headerName: "Full Conversation Log", cellRenderer: ViewLogButtonComponent }

    ]);



    useEffect(() => {
        // getAllIntentsData()
        // showNotification('First notification', 'info');
        // showNotification('Second notification', 'success');
        // showNotification('Third notification', 'warning', 8000); // Custom duration

        // Call the function immediately and then every 30 seconds
        getAllIntentsData();
        const intervalId = setInterval(() => {
            getAllIntentsData();
        }, 10000);

        // Cleanup the interval when the component is unmounted
        return () => {
            clearInterval(intervalId);
        };

    }, []);

    const getAllIntentsData = async () => {
        const intentsApiResponse = await httpGet(EC2_API_ENDPOINT + INTENTS_API_URI + "/" + getDaysSinceEpoch(+Date.now()) + "?range=2", true);
        const intents = [];
        Object.keys(intentsApiResponse).forEach(daysSinceEpoch => {
            intents.push(...intentsApiResponse[daysSinceEpoch]);
        })
        intents.sort((a, b) => b.requestedTime - a.requestedTime);
        // console.log("Intents = ", intents)
        setAllIntents(intents);
        setRowData(intents);
    }

    // const SaveChangesButtonComponent = (rowInfo) => {

    //     const handleClick = async (rowInfo, eventObj) => {
    //         alert("Data updated")
    //     }

    //     return <button style={{
    //         backgroundColor: "#4CAF50",
    //         color: "white",
    //         padding: "10px 15px",
    //         border: "none",
    //         borderRadius: "5px",
    //         cursor: "pointer",
    //         fontSize: "14px",
    //     }} onClick={(eventObj) => handleClick(rowInfo, eventObj)}>Save Changes</button>;
    // };

    return (
        <>
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
            {isPopupOpen && (
                <PopupComponent
                    data={popupData}
                    onClose={() => setIsPopupOpen(false)}
                />
            )}
        </>
    );
}

export default Intents;


// Popup Component
const PopupComponent = ({ data, onClose }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                width: "50%",
            }}
        >
            <h3>Conversation Log</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                {/* <thead>
                    <tr>
                        <th style={{ width: "20%", textAlign: "left", borderBottom: "1px solid #ddd" }}>Key</th>
                        <th style={{ width: "80%", textAlign: "left", borderBottom: "1px solid #ddd" }}>Value</th>
                    </tr>
                </thead> */}
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>{row.key}</td>
                            <td style={{ width: "80%", padding: "8px", borderBottom: "1px solid #ddd" }}>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                style={{
                    marginTop: "10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                }}
                onClick={onClose}
            >
                Close
            </button>
        </div>
    );
};