import React, { useState } from "react";

const StaffDirectory = () => {
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState(["HR", "Finance", "IT", "Operations"]);
    const [roles, setRoles] = useState(["Manager", "Engineer", "Analyst"]);
    const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
    const [showRolePopup, setShowRolePopup] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: "", phone: "", department: "", role: "" });
    const [editIndex, setEditIndex] = useState(null);

    const handleAddStaff = () => {
        if (editIndex !== null) {
            const updatedStaffList = [...staffList];
            updatedStaffList[editIndex] = currentStaff;
            setStaffList(updatedStaffList);
            setEditIndex(null);
        } else {
            setStaffList([...staffList, currentStaff]);
        }
        setCurrentStaff({ name: "", phone: "", department: "", role: "" });
    };

    const handleEditStaff = (index) => {
        setCurrentStaff(staffList[index]);
        setEditIndex(index);
    };

    const handleDeleteStaff = (index) => {
        const updatedStaffList = staffList.filter((_, i) => i !== index);
        setStaffList(updatedStaffList);
    };

    const handleAddDepartment = (newDepartment) => {
        setDepartments([...departments, newDepartment]);
    };

    const handleDeleteDepartment = (index) => {
        const updatedDepartments = departments.filter((_, i) => i !== index);
        setDepartments(updatedDepartments);
    };

    const handleAddRole = (newRole) => {
        setRoles([...roles, newRole]);
    };

    const handleDeleteRole = (index) => {
        const updatedRoles = roles.filter((_, i) => i !== index);
        setRoles(updatedRoles);
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
            <h2 style={{
                textAlign: "center",
                color: "#333",
                marginBottom: "20px"
            }}>Staff Management</h2>

            <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Name:
                    <input
                        type="text"
                        value={currentStaff.name}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Phone Number:
                    <input
                        type="text"
                        value={currentStaff.phone}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Department:
                    <select
                        value={currentStaff.department}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, department: e.target.value })}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    >
                        <option value="">Select a Department</option>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowDepartmentPopup(true)}
                        style={{
                            marginTop: "10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "8px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        Manage Departments
                    </button>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Role:
                    <select
                        value={currentStaff.role}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    >
                        <option value="">Select a Role</option>
                        {roles.map((role, index) => (
                            <option key={index} value={role}>{role}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowRolePopup(true)}
                        style={{
                            marginTop: "10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "8px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        Manage Roles
                    </button>
                </label>
                <button
                    type="button"
                    onClick={handleAddStaff}
                    style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    {editIndex !== null ? "Update Staff" : "Add Staff"}
                </button>
            </form>

            <h3 style={{ textAlign: "center", color: "#333", marginTop: "20px" }}>Staff List</h3>
            <ul>
                {staffList.map((staff, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                        {`${staff.name} (${staff.phone}) - ${staff.department} (${staff.role})`}
                        <button onClick={() => handleEditStaff(index)} style={{ marginLeft: "10px" }}>Edit</button>
                        <button onClick={() => handleDeleteStaff(index)} style={{ marginLeft: "10px" }}>Delete</button>
                    </li>
                ))}
            </ul>

            {showDepartmentPopup && (
                <Popup
                    title="Manage Departments"
                    items={departments}
                    onAdd={handleAddDepartment}
                    onDelete={handleDeleteDepartment}
                    onClose={() => setShowDepartmentPopup(false)}
                />
            )}

            {showRolePopup && (
                <Popup
                    title="Manage Roles"
                    items={roles}
                    onAdd={handleAddRole}
                    onDelete={handleDeleteRole}
                    onClose={() => setShowRolePopup(false)}
                />
            )}
        </div>
    );
};

const Popup = ({ title, items, onAdd, onDelete, onClose }) => {
    const [newItem, setNewItem] = useState("");

    return (
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
        }}>
            <h3>{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        {item}
                        <button onClick={() => onDelete(index)} style={{ marginLeft: "10px" }}>Delete</button>
                    </li>
                ))}
            </ul>
            <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Add new ${title.toLowerCase()}`}
                style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    marginTop: "10px"
                }}
            />
            <button
                onClick={() => {
                    onAdd(newItem);
                    setNewItem("");
                }}
                style={{
                    marginTop: "10px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "8px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                }}
            >
                Add
            </button>
            <button onClick={onClose} style={{
                marginTop: "10px",
                marginLeft: "10px",
                backgroundColor: "#FF4136",
                color: "white",
                padding: "8px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px"
            }}>
                Close
            </button>
        </div>
    );
};

export default StaffDirectory;