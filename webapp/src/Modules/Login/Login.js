import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import AuthContext from "./AuthContext";
import styled from "styled-components";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { httpPost } from "../../Services/APIService";
import BlueGoldButton from "../../Common/Button/BlueGoldButton";
import InputField from "../../Common/InputField/InputField";
import AuthContext from "./AuthContext";

const Login = () => {
    const [hotelId, setHotelId] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        if (!hotelId || !username || !password) {
            setError("Please enter hotel id, username and password");
            return;
        }
        try {
            const response = await httpPost(EC2_API_ENDPOINT + "/login", { username, password, hotelId });
            if (!response || response.statusText !== "OK") {
                setError("Invalid hotel id or username or password");
                return;
            }
            setError("");

            login(response.data.token);
            const redirect = localStorage.getItem("redirect");
            localStorage.setItem("hotelId", hotelId);
            localStorage.setItem("username", username);
            if (redirect) {
                localStorage.removeItem("redirect");
                navigate(redirect)
            } else {
                navigate("/requests")
            }

        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };


    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2 style={{ marginBottom: "20px" }}> Login</h2>
            <form >
                <InputContainer  >
                    <Label>Hotel ID</Label>
                    <InputField
                        type="text"
                        value={hotelId}
                        onChange={(e) => setHotelId(e.target.value)} />
                </InputContainer>
                <InputContainer  >
                    <Label>Username</Label>
                    <InputField
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} />
                </InputContainer>
                <InputContainer  >
                    <Label>Password</Label>
                    <InputField
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </InputContainer>
                <InputContainer  >
                    <BlueGoldButton text={"Login"} clickHandler={handleLogin} />
                </InputContainer>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;


const InputContainer = styled.div`
    margin-bottom: 20px
`;

const Label = styled.label`
    font-weight: bold
`;


