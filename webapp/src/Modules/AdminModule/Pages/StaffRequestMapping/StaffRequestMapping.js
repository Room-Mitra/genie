import React, { useState } from "react";

const StaffRequestMapping = () => {
    const [staffMappings, setStaffMappings] = useState([]);
    const [staffName, setStaffName] = useState("");
    const [staffPhone, setStaffPhone] = useState("");
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [requestType, setRequestType] = useState("");
    const [managerName, setManagerName] = useState("");
    const [escalationPhone, setEscalationPhone] = useState("");
    const [escalationTime, setEscalationTime] = useState(""); // Escalation time in minutes
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const [departments] = useState(["Housekeeping", "Maintenance", "Room Service", "Front Desk", "Security"]);
    const [availableRooms] = useState([101, 102, 103, 104, 105, 201, 202, 203, 204, 205]); // Example room numbers
    const [staffList] = useState([
        { name: "Alice Smith", phone: "1234567890" },
        { name: "Bob Johnson", phone: "9876543210" },
        { name: "Charlie Brown", phone: "1122334455" },
        { name: "Diana Prince", phone: "9988776655" }
    ]); // Predefined staff list with names and phone numbers
    const [managerList] = useState([
        { name: "Emily Davis", phone: "5566778899" },
        { name: "Frank Wilson", phone: "6677889900" }
    ]); // Predefined manager list with names and phone numbers

    const handleAddOrUpdateMapping = () => {
        if (!staffName || !staffPhone || selectedRooms.length === 0 || !requestType) {
            alert("All fields are required!");
            return;
        }

        const newMapping = {
            staffName,
            staffPhone,
            rooms: selectedRooms,
            requestType,
            managerName,
            escalationPhone,
            escalationTime,
            isActive: true // Default to active
        };

        if (isEditing) {
            const updatedMappings = [...staffMappings];
            updatedMappings[editingIndex] = newMapping;
            setStaffMappings(updatedMappings);
            setIsEditing(false);
            setEditingIndex(null);
        } else {
            setStaffMappings([...staffMappings, newMapping]);
        }

        setStaffName("");
        setStaffPhone("");
        setSelectedRooms([]);
        setRequestType("");
        setManagerName("");
        setEscalationPhone("");
        setEscalationTime("");
    };

    const handleEditMapping = (index) => {
        const mapping = staffMappings[index];
        setStaffName(mapping.staffName);
        setStaffPhone(mapping.staffPhone);
        setSelectedRooms(mapping.rooms);
        setRequestType(mapping.requestType);
        setManagerName(mapping.managerName);
        setEscalationPhone(mapping.escalationPhone);
        setEscalationTime(mapping.escalationTime);
        setIsEditing(true);
        setEditingIndex(index);
    };

    const handleDeleteMapping = (index) => {
        const updatedMappings = staffMappings.filter((_, i) => i !== index);
        setStaffMappings(updatedMappings);
    };

    const handleToggleMappingStatus = (index) => {
        const updatedMappings = [...staffMappings];
        updatedMappings[index].isActive = !updatedMappings[index].isActive;
        setStaffMappings(updatedMappings);
    };

    const handleRoomSelectionChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
        setSelectedRooms(selectedOptions);
    };

    const handleStaffNameChange = (e) => {
        const selectedName = e.target.value;
        setStaffName(selectedName);

        // Autofill staff phone number based on the selected name
        const staff = staffList.find((s) => s.name === selectedName);
        if (staff) {
            setStaffPhone(staff.phone);
        } else {
            setStaffPhone(""); // Clear phone number if no match
        }
    };

    const handleManagerNameChange = (e) => {
        const selectedName = e.target.value;
        setManagerName(selectedName);

        // Autofill escalation phone number based on the selected manager's name
        const manager = managerList.find((m) => m.name === selectedName);
        if (manager) {
            setEscalationPhone(manager.phone);
        } else {
            setEscalationPhone(""); // Clear phone number if no match
        }
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
            }}>Staff Request Mapping</h2>

            <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Staff Name:
                    <select
                        value={staffName}
                        onChange={handleStaffNameChange}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    >
                        <option value="">Select a Staff Member</option>
                        {staffList.map((staff, index) => (
                            <option key={index} value={staff.name}>{staff.name}</option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Staff Phone Number:
                    <input
                        type="text"
                        value={staffPhone}
                        readOnly
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            backgroundColor: "#f0f0f0",
                            cursor: "not-allowed"
                        }}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Room Numbers:
                    <select
                        multiple
                        value={selectedRooms}
                        onChange={handleRoomSelectionChange}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            height: "100px"
                        }}
                    >
                        {availableRooms.map((room, index) => (
                            <option key={index} value={room}>{room}</option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Request Type (Department):
                    <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
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
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Manager Name (for Escalation):
                    <select
                        value={managerName}
                        onChange={handleManagerNameChange}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    >
                        <option value="">Select a Manager</option>
                        {managerList.map((manager, index) => (
                            <option key={index} value={manager.name}>{manager.name}</option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Escalation Phone Number:
                    <input
                        type="text"
                        value={escalationPhone}
                        readOnly
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            backgroundColor: "#f0f0f0",
                            cursor: "not-allowed"
                        }}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Escalation Time (in minutes):
                    <input
                        type="number"
                        value={escalationTime}
                        onChange={(e) => setEscalationTime(e.target.value)}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px"
                        }}
                    />
                </label>
                <button
                    type="button"
                    onClick={handleAddOrUpdateMapping}
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
                    {isEditing ? "Update Mapping" : "Add Mapping"}
                </button>
            </form>

            <h3 style={{ textAlign: "center", color: "#333", marginTop: "20px" }}>Mappings</h3>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px"
            }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Staff Name</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Phone</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Rooms</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Department</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Manager</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Escalation Phone</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Escalation Time</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Status</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staffMappings.map((mapping, index) => (
                        <tr key={index}>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.staffName}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.staffPhone}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.rooms.join(", ")}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.requestType}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.managerName}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.escalationPhone}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mapping.escalationTime || "N/A"}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px", color: mapping.isActive ? "green" : "red" }}>
                                {mapping.isActive ? "Active" : "Inactive"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                                <button
                                    onClick={() => handleEditMapping(index)}
                                    style={{
                                        backgroundColor: "#FFC107",
                                        color: "black",
                                        padding: "5px",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        marginRight: "5px"
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteMapping(index)}
                                    style={{
                                        backgroundColor: "#FF4136",
                                        color: "white",
                                        padding: "5px",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        marginRight: "5px"
                                    }}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleToggleMappingStatus(index)}
                                    style={{
                                        backgroundColor: mapping.isActive ? "#6c757d" : "#28a745",
                                        color: "white",
                                        padding: "5px",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                    }}
                                >
                                    {mapping.isActive ? "Disable" : "Enable"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StaffRequestMapping;