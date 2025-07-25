import React, { useState, useRef, useEffect, useContext } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import SubMenu from "./Submenu";
import { IconContext } from "react-icons/lib";
import HOTEL_CONSTANTS from "../../Constants/Hotel.constants";
import AuthContext from "../../Modules/Login/AuthContext";


const Sidebar = () => {
    const { isAuthenticated } = useContext(AuthContext);

    const [sidebar, setSidebar] = useState(false);
    const [hotelName, setHotelName] = useState(HOTEL_CONSTANTS.HOTEL_NAME);
    const sidebarRef = useRef(null);

    const showSidebar = () => setSidebar(!sidebar);

    // Hide sidebar when clicking outside
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setSidebar(false);
        }
    };

    useEffect(() => {
        if (sidebar) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sidebar]);

    useEffect(() => {
        const loggedInHotelName = localStorage.getItem("hotelId")
        if (isAuthenticated && loggedInHotelName) {
            setHotelName(loggedInHotelName);
        } else {
            setHotelName(HOTEL_CONSTANTS.HOTEL_NAME);
        }
    }, [isAuthenticated]);

    return (
        <>
            <IconContext.Provider value={{ color: "#fff" }}>
                <Nav>
                    <NavIcon to="#">
                        <FaIcons.FaBars onClick={showSidebar} />
                    </NavIcon>
                    <H1>  {hotelName}  </H1>
                </Nav>
                <SidebarNav sidebar={sidebar} ref={sidebarRef}>
                    <SidebarWrap>
                        <NavIcon to="#">
                            <AiIcons.AiOutlineClose onClick={showSidebar} />
                        </NavIcon>
                        {SidebarData.map((item, index) => {
                            return (
                                <SubMenu
                                    item={item}
                                    key={index}
                                />
                            );
                        })}
                    </SidebarWrap>
                </SidebarNav>
            </IconContext.Provider>
        </>
    );
};

export default Sidebar;

const H1 = styled.h1`
    text-align: center;
    color: #E2C044;
    left: 40%;
    position: absolute
`;

const Nav = styled.div`
    background: #161032;
    height: 80px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
`;

const NavIcon = styled(Link)`
    margin-left: 2rem;
    font-size: 2rem;
    height: 80px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
`;

const SidebarNav = styled.nav`
    background: #161032;
    width: 250px;
    height: 100vh;
    display: flex;
    justify-content: center;
    position: fixed;
    top: 0;
    left: ${({ sidebar }) => (sidebar ? "0" : "-100%")};
    transition: 350ms;
    z-index: 10;
`;

const SidebarWrap = styled.div`
    width: 100%;
`;