import React, { useEffect, useState } from "react";
import StaffDirectoryPopup from "./StaffDirectoryPopup";
import BlueGoldButton from "../../../../Common/Button/BlueGoldButton";
import SecondaryButton from "../../../../Common/Button/SecondaryButton";
import { httpGet, httpPost } from "../../../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../../../Constants/Environment.constants";

const StaffDirectory = () => {
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState(["Housekeeping", "Restaurant", "Front Desk", "Facilities"]);
    const [roles, setRoles] = useState(["Manager", "Staff"]);
    // const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
    // const [showRolePopup, setShowRolePopup] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: "", phone: "", department: "", role: "" });
    const [editIndex, setEditIndex] = useState(null);
    const [showForm, setShowForm] = useState(false); // To toggle the form section
    const [searchQuery, setSearchQuery] = useState(""); // For filtering staff list
    const [isAddStaffError, setIsAddStaffError] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    useEffect(() => {
        const fetchStaffList = async () => {
            const response = await httpGet(EC2_API_ENDPOINT + "/staff", true);
            console.log(response)
            setStaffList(response && response.staffData ? response.staffData : []);
        }
        fetchStaffList();
    }, [])

    const handleAddStaff = (e) => {
        e.preventDefault();
        console.log(currentStaff)
        if (!currentStaff.name || !currentStaff.phone || !currentStaff.department || !currentStaff.role) {
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
        setCurrentStaff({ name: "", phone: "", department: "", role: "" });
        setShowForm(false); // Collapse the form after adding/updating
        updateStaffListApi(updatedStaffList)
    };

    const updateStaffListApi = async (newStaffList) => {
        const response = await httpPost(EC2_API_ENDPOINT + "/staff", newStaffList);
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

    // const handleAddDepartment = (newDepartment) => {
    //     setDepartments([...departments, newDepartment]);
    // };

    // const handleDeleteDepartment = (index) => {
    //     const updatedDepartments = departments.filter((_, i) => i !== index);
    //     setDepartments(updatedDepartments);
    // };

    // const handleAddRole = (newRole) => {
    //     setRoles([...roles, newRole]);
    // };

    // const handleDeleteRole = (index) => {
    //     const updatedRoles = roles.filter((_, i) => i !== index);
    //     setRoles(updatedRoles);
    // };

    const filteredStaffList = staffList.filter((staff) => {
        const query = searchQuery.toLowerCase();
        return (
            staff.name.toLowerCase().includes(query) ||
            staff.phone.toLowerCase().includes(query) ||
            staff.department.toLowerCase().includes(query) ||
            staff.role.toLowerCase().includes(query)
        );
    });

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
                    <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                        Department:
                        <select
                            value={currentStaff.department}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, department: e.target.value })}
                            style={InputElementStyle}
                        >
                            <option value="">Select a Department</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept}>{dept}</option>
                            ))}
                        </select>
                        {/* <SecondaryButton clickHandler={(e) => { e.preventDefault(); setShowDepartmentPopup(true) }} text="Manage Departments" /> */}
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                        Role:
                        <select
                            value={currentStaff.role}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
                            style={InputElementStyle}
                        >
                            <option value="">Select a Role</option>
                            {roles.map((role, index) => (<option key={index} value={role}>{role}</option>))}
                        </select>
                        {/* <SecondaryButton clickHandler={(e) => { e.preventDefault(); setShowRolePopup(true) }} text="Manage Roles" /> */}
                    </label>
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
                            {["name", "phone", "department", "role"].map((key, index) => (
                                <td key={index} style={TableDataStyle}>{staff[key]}</td>
                            ))}
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


            {/* {showDepartmentPopup && (
                <StaffDirectoryPopup
                    title="Manage Departments"
                    items={departments}
                    onAdd={handleAddDepartment}
                    onDelete={handleDeleteDepartment}
                    onClose={() => setShowDepartmentPopup(false)}
                />
            )}

            {showRolePopup && (
                <StaffDirectoryPopup
                    title="Manage Roles"
                    items={roles}
                    onAdd={handleAddRole}
                    onDelete={handleDeleteRole}
                    onClose={() => setShowRolePopup(false)}
                />
            )} */}
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