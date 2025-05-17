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
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }
        try {
            const response = await httpPost(EC2_API_ENDPOINT + "/login", { username, password });
            console.log(response)
            if (!response || response.statusText !== "OK") {
                setError("Invalid username or password");
                return;
            }
            setError("");

            // const data = await response.json();
            login(response.data.token);
            // navigate("/faq");
            const redirect = localStorage.getItem("redirect");
            if (redirect) {
                navigate(redirect)
                localStorage.removeItem("redirect");
            }

        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        console.log(error);
    }, [error]);

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2 style={{ marginBottom: "20px" }}> Login</h2>
            <form >
                <InputContainer  >
                    <Label>Username</Label>
                    <InputField
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} />
                </InputContainer>
                <InputContainer  >
                    <Label >Password</Label>
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


