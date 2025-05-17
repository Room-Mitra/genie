import styled from "styled-components";


const BlueGoldButton = ({ clickHandler, text }) => {
    return (
        <Button onClick={clickHandler}>{text}</Button>
    )

}

export default BlueGoldButton;


const Button = styled.button`
    background-color: #161032;
    color: #e2c044;
    font-weight: bold;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        opacity: 0.9;
    }
`;
