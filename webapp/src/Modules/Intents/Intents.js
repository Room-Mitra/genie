// Required imports
import { useEffect, useState, useRef } from "react";
import { httpGet, httpPost, httpPut } from "../../Services/APIService";
import DataTable from "../../Common/DataTable/DataTable";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { getDaysSinceEpoch } from "../../Services/Common.service";
import chimeSound from "../../assets/room-mitra-chime.wav"; // Adjust path

const INTENTS_API_URI = '/intents';

const Intents = () => {
    const [allIntents, setAllIntents] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState([]);
    const audioRef = useRef(null);
    const popupRef = useRef(null);
    const [acknowledgedIds, setAcknowledgedIds] = useState(new Set());
    const lastRequestTimestamp = useRef(0);

    const handleAcknowledgeToggle = async (ts) => {
        //await postUpdate

        // const response = await httpPost(EC2_API_ENDPOINT + INTENTS_API_URI,{});
        console.log(ts, allIntents, rowData)
        getAllIntentsData();
    }
    const AcknowledgeCheckboxComponent = (rowInfo) => {
        return (
            <input
                type="checkbox"
                checked={rowInfo.data.isAcknowledged}
                onChange={() => handleAcknowledgeToggle(rowInfo.data.requestedTime)}
            />
        )
    }


    const ViewLogButtonComponent = (rowInfo) => {
        const handleClick = () => {
            const data = [];
            const history = rowInfo.data?.conversationLog?.history || [];
            history.forEach(speech => {
                if (speech?.role) {
                    if (speech.role.toLowerCase() === "user") {
                        data.push({ key: "Guest", value: speech.content });
                    } else if (speech.role.toLowerCase() === "assistant") {
                        try {
                            const parsed = JSON.parse(speech.content);
                            if (parsed?.messages?.length) {
                                data.push({ key: "RoomMitra", value: parsed.messages.join(". ") });
                            }
                        } catch { }
                    }
                }
            });
            setPopupData(data);
            setIsPopupOpen(true);
        };

        return <button style={btnStyle} onClick={handleClick}>View Log</button>;
    };

    const btnStyle = {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
    };

    const [colDefs] = useState([
        { headerName: "Date", valueGetter: p => new Date(p.data.requestedTime).toLocaleDateString(), filter: true, width: 110 },
        { headerName: "Time", valueGetter: p => new Date(p.data.requestedTime).toLocaleTimeString(), filter: true, width: 110 },
        { headerName: "Name", field: "intentName", filter: true, editable: true, width: 350 },
        { headerName: "Type", field: "intentType", filter: true, editable: true },
        { headerName: "Room", field: "roomId", filter: true, editable: false, width: 210 },
        { headerName: "Acknowledge", field: "acknowledged", cellRenderer: AcknowledgeCheckboxComponent, width: 130 },
        { headerName: "Full Conversation Log", cellRenderer: ViewLogButtonComponent }
    ]);

    useEffect(() => {
        getAllIntentsData();
        const intervalId = setInterval(getAllIntentsData, 10000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (isPopupOpen && popupRef.current) popupRef.current.focus();
    }, [isPopupOpen]);

    const getAllIntentsData = async () => {
        const response = await httpGet(EC2_API_ENDPOINT + INTENTS_API_URI + "/" + getDaysSinceEpoch(+Date.now()) + "?range=2", true);
        const intents = [];
        Object.keys(response).forEach(key => intents.push(...response[key]));
        intents.sort((a, b) => b.requestedTime - a.requestedTime);

        if (intents.length && intents[0].requestedTime > lastRequestTimestamp.current) {
            lastRequestTimestamp.current = intents[0].requestedTime;
            if (audioRef.current) audioRef.current.play();
        }

        setAllIntents(intents);
        setRowData(intents);
    }

    return (
        <>
            <audio ref={audioRef} src={chimeSound} preload="auto" />
            <div style={containerStyle}>
                <h1 style={titleStyle}>REQUESTS</h1>
                {allIntents ? (
                    <div style={tableContainerStyle}>
                        <DataTable rowData={rowData} columnDefs={colDefs} />
                    </div>
                ) : (
                    <div style={loadingStyle}>Loading Intents...</div>
                )}
            </div>
            {isPopupOpen && (
                <PopupComponent
                    data={popupData}
                    onClose={() => setIsPopupOpen(false)}
                    popupRef={popupRef}
                />
            )}
        </>
    );
}

export default Intents;

const PopupComponent = ({ data, onClose, popupRef }) => (
    <div
        ref={popupRef}
        tabIndex={-1}
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
            outline: "none"
        }}
    >
        <h3>Conversation Log</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

const containerStyle = {
    fontFamily: "'Arial', sans-serif",
    margin: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
};

const titleStyle = {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px"
};

const tableContainerStyle = {
    height: "500px",
    overflow: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "5px",
    padding: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
};

const loadingStyle = {
    textAlign: "center",
    color: "#777",
    fontSize: "16px",
    marginTop: "20px"
};
