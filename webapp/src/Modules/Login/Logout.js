import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";

const Logout = () => {
    const { logout } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        // Clear token from localStorage
        logout()

        // Redirect to login page after 5 seconds
        const timer = setTimeout(() => {
            navigate("/login");
        }, 5000);

        // Cleanup timer on component unmount
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={styles.container}>
            <h1 style={styles.message}>You have been logged out successfully.</h1>
            <h2 style={styles.subMessage}>Redirecting to login page...</h2>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        color: "#343a40",
        fontFamily: "Arial, sans-serif",
    },
    message: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    subMessage: {
        fontSize: "16px",
        color: "#6c757d",
    },
};

export default Logout;