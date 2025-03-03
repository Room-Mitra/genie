
import { useEffect, useState } from "react";
import { httpGet } from "../../../../Services/APIService";
import DataTable from "../../../../Common/DataTable/DataTable";


const Devices = () => {

    useEffect(() => {
        httpGet('http://34.240.95.34:3000/devices');
        console.log("******")
    }, []);

    // const allDevices = httpGet('http://34.240.95.34:3000/devices');


    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" }
    ]);

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