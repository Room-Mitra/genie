import React, { useEffect, useState } from "react";
import StaffDirectoryPopup from "./StaffDirectoryPopup";
import BlueGoldButton from "../../../../Common/Button/BlueGoldButton";
import SecondaryButton from "../../../../Common/Button/SecondaryButton";
import { httpGet, httpPost } from "../../../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../../../Constants/Environment.constants";
import Select from 'react-select';

const STAFF_API_URI = '/staff';

const StaffDirectory = () => {
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState([
        { value: "House Keeping", label: "House Keeping" },
        { value: "Room Service", label: "Room Service" },
        { value: "Restaurant", label: "Restaurant" },
        { value: "Front Desk", label: "Front Desk" },
        { value: "Facilities", label: "Facilities" },
        { value: "Security", label: "Security" }]);
    const [roles, setRoles] = useState([
        { value: "Manager", label: "Manager" },
        { value: "Staff", label: "Staff" }
    ]);
    // const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
    // const [showRolePopup, setShowRolePopup] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: "", phone: "", department: [], role: [] });
    const [editIndex, setEditIndex] = useState(null);
    const [showForm, setShowForm] = useState(false); // To toggle the form section
    const [searchQuery, setSearchQuery] = useState(""); // For filtering staff list
    const [isAddStaffError, setIsAddStaffError] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    useEffect(() => {
        const fetchStaffList = async () => {
            const response = await httpGet(EC2_API_ENDPOINT + STAFF_API_URI, true);
            console.log(response)
            const staffData = response && response.staffData ? response.staffData : [];
            // Transform staffData to match the expected structure
            staffData.forEach(staff => {
                staff.department = staff.department.map(department => ({ value: department, label: department }));
                staff.role = staff.role.map(role => ({ value: role, label: role }));
            })
            setStaffList(staffData);
        }
        fetchStaffList();
    }, [])

    const handleAddStaff = (e) => {
        e.preventDefault();
        console.log(currentStaff, staffList)
        if (!currentStaff.name || !currentStaff.phone || !currentStaff.department.length || !currentStaff.role.length) {
            setIsAddStaffError(true)
            return;
        } else {
            setIsAddStaffError(false)
        }
        let updatedStaffList;
        if (editIndex !== null) {
            updatedStaffList = [...staffList];
            updatedStaffList[editIndex] = currentStaff;
            setStaffList(updatedStaffList);
            setEditIndex(null);
        } else {
            updatedStaffList = [...staffList, currentStaff]
            setStaffList(updatedStaffList);
        }
        setCurrentStaff({ name: "", phone: "", department: [], role: [] });
        setShowForm(false); // Collapse the form after adding/updating
        updateStaffListApi(updatedStaffList)
    };

    const updateStaffListApi = async (newStaffList) => {
        newStaffList = JSON.parse(JSON.stringify(newStaffList));
        console.log(newStaffList)
        // Transform staffData to match the expected structure
        for (let i = 0; i < newStaffList.length; i++) {
            newStaffList[i].role = newStaffList[i].role.map(r => r.value);
            newStaffList[i].department = newStaffList[i].department.map(d => d.value);
        }
        const response = await httpPost(EC2_API_ENDPOINT + STAFF_API_URI, newStaffList);
        console.log(response)
    }

    const handleEditStaff = (index) => {
        setCurrentStaff(staffList[index]);
        setEditIndex(index);
        setShowForm(true); // Expand the form for editing
    };

    const handleDeleteStaff = (index) => {
        setStaffToDelete(index); // Store the index of the staff to delete
        setShowDeleteConfirmation(true); // Show the confirmation popup
    };

    const confirmDeleteStaff = () => {
        if (staffToDelete !== null) {
            const updatedStaffList = [...staffList];
            updatedStaffList.splice(staffToDelete, 1); // Remove the staff member
            setStaffList(updatedStaffList);
            setStaffToDelete(null); // Clear the staff to delete
            setShowDeleteConfirmation(false); // Hide the confirmation popup
            updateStaffListApi(updatedStaffList);
        }
    };

    const cancelDeleteStaff = () => {
        setStaffToDelete(null); // Clear the staff to delete
        setShowDeleteConfirmation(false); // Hide the confirmation popup
    };

    const filteredStaffList = staffList.filter((staff) => {
        const query = searchQuery.toLowerCase();
        return (
            staff.name.toLowerCase().includes(query) ||
            staff.phone.toLowerCase().includes(query) ||
            staff.department?.map((d) => d.value).join(", ").toLowerCase().includes(query) ||
            staff.role?.map((r) => r.value).join(", ").toLowerCase().includes(query)
        );
    });
    const handleDepartmentChange = (selectedOptions) => {
        console.log(selectedOptions)
        setCurrentStaff((prevState) => ({
            ...prevState,
            department: selectedOptions || [],
        }));
    };

    const handleRoleChange = (selectedOptions) => {
        setCurrentStaff((prevState) => ({
            ...prevState,
            role: selectedOptions || [],
        }));
    };
    return (
        <div style={ComponentContainerStyle}>
            <h2 style={{
                textAlign: "center",
                color: "#333",
                marginBottom: "20px"
            }}>Staff Directory</h2>

            {/* Button to toggle form visibility */}
            <BlueGoldButton
                clickHandler={() => setShowForm(!showForm)}
                text={showForm ? "Close Form" : "Add New Staff"}
            />


            {/* Collapsible form section */}
            {showForm && (
                <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                        Name:
                        <input
                            type="text"
                            value={currentStaff.name}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                            style={InputElementStyle}
                        />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                        Phone Number:
                        <input
                            type="text"
                            value={currentStaff.phone}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                            style={InputElementStyle}
                        />
                    </label>

                    <label htmlFor="departments">Departments</label>
                    <Select
                        id="departments"
                        isMulti
                        options={departments}
                        value={currentStaff.department}
                        onChange={handleDepartmentChange}
                        placeholder="Select Departments"
                    />

                    <label htmlFor="roles">Roles</label>
                    <Select
                        id="roles"
                        isMulti
                        options={roles}
                        value={currentStaff.role}
                        onChange={handleRoleChange}
                        placeholder="Select Roles"
                    />
                    {isAddStaffError && (<span style={{ color: 'red' }}>All fields are required</span>)}
                    <SecondaryButton
                        clickHandler={handleAddStaff}
                        text={editIndex !== null ? "Update Staff" : "Add Staff"}
                    />
                </form>
            )}

            {/* Search bar for filtering */}
            <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={SearchBarStyle}
            />
            {/* Confirmation Popup */}
            {showDeleteConfirmation && (
                <div className="popup">
                    <p>Are you sure you want to delete this staff member?{`(${(staffList[staffToDelete].name)})`}</p>
                    <BlueGoldButton
                        clickHandler={confirmDeleteStaff}
                        text={"Yes"}
                    />
                    <SecondaryButton
                        clickHandler={cancelDeleteStaff}
                        text={"No"}
                    />
                </div>
            )}
            {/* Staff list as a table */}
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px"
            }}>
                <thead>
                    <tr>
                        {["Name", "Phone", "Department", "Role", "Actions"].map((header, index) => (
                            <th key={index} style={TableHeaderStyle}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredStaffList.map((staff, index) => (
                        <tr key={index}>
                            <td key={index} style={TableDataStyle}>{staff["name"]}</td>
                            <td key={index} style={TableDataStyle}>{staff["phone"]}</td>
                            <td key={index} style={TableDataStyle}>{staff["department"].map(x => x.value).join(", ")}</td>
                            <td key={index} style={TableDataStyle}>{staff["role"].map(x => x.value).join(", ")}</td>
                            <td style={TableDataStyle}>
                                <button
                                    onClick={() => handleEditStaff(index)}
                                    style={{ marginRight: "10px", backgroundColor: "#FFC107", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteStaff(index)}
                                    style={{ backgroundColor: "#FF4136", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer", color: "white" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default StaffDirectory;


const TableHeaderStyle = { border: "1px solid #ccc", padding: "10px" }
const TableDataStyle = { border: "1px solid #ccc", padding: "10px" }
const InputElementStyle = { padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }
const SearchBarStyle = {
    padding: "10px",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "100%"
}
const ComponentContainerStyle = {
    fontFamily: "'Arial', sans-serif",
    margin: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
}