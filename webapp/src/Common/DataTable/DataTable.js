import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
// SOURCE  :: https://www.ag-grid.com/react-data-grid/getting-started/
const DataTable = ({ rowData, columnDefs }) => {
    ModuleRegistry.registerModules([AllCommunityModule]);


    return (<>
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
        />
    </>)

}

export default DataTable;