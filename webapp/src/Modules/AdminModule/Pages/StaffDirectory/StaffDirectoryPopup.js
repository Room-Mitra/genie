import { useState } from "react";
import BlueGoldButton from "../../../../Common/Button/BlueGoldButton";
import SecondaryButton from "../../../../Common/Button/SecondaryButton";

const StaffDirectoryPopup = ({ title, items, onAdd, onDelete, onClose }) => {
    const [newItem, setNewItem] = useState("");

    const onAddItem = () => {
        onAdd(newItem);
        setNewItem("");
    }

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
                        <button onClick={() => onDelete(index)} style={{
                            marginLeft: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#E53E3E", // Red color for delete
                            color: "#fff", // White text for contrast
                            border: "none", // Remove default border
                            borderRadius: "5px", // Rounded corners
                            cursor: "pointer", // Pointer cursor for interactivity
                            transition: "background-color 0.3s ease" // Smooth hover effect
                        }}>Delete</button>
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
            <BlueGoldButton clickHandler={onAddItem} text={"Add"} />
            <SecondaryButton clickHandler={onClose} text={"Close"} />
        </div>
    );
};

export default StaffDirectoryPopup;