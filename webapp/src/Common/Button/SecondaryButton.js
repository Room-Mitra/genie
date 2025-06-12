import styled from "styled-components";


const SecondaryButton = ({ clickHandler, text }) => {
    return (
        <Button onClick={clickHandler}>{text}</Button>
    )

}

export default SecondaryButton;


const Button = styled.button`
    margin-top: 10px;
    margin-left: 10px;
    background-color: #e2c044;
    color:  #161032;
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
