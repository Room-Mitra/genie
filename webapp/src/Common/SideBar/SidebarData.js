// Filename - components/SidebarData.js

import React from "react";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";
import * as LuIcons from "react-icons/lu";
import * as MdIcons from "react-icons/md";
import * as GrIcons from "react-icons/gr";
import * as Io5Icons from "react-icons/io5";

export const SidebarData = [
    {
        title: "Requests",
        path: "/requests",
        icon: <MdIcons.MdRoomService />,
    },
    // {
    //     title: "Check In",
    //     path: "/check-in",
    //     icon: <RiIcons.RiLogoutBoxFill />,
    // },
    // {
    //     title: "Check Out",
    //     path: "/check-out",
    //     icon: <Io5Icons.IoLogOut />,
    // },
    {
        title: "Admin",
        icon: <IoIcons.IoIosPaper />,
        iconClosed: <RiIcons.RiArrowDownSFill />,
        iconOpened: <RiIcons.RiArrowUpSFill />,
        subNav: [
            {
                title: "Devices",
                path: "/admin/devices",
                icon: <MdIcons.MdOutlineDevices />,
                cName: "sub-nav",
            },
            // {
            //     title: "Staff Directory",
            //     path: "/admin/staff-directory",
            //     icon: <FaIcons.FaPhone />,
            //     cName: "sub-nav",
            // },
            // {
            //     title: "Staff Request Mapping",
            //     path: "/admin/staff-request-mapping",
            //     icon: <FaIcons.FaEnvelopeOpenText />,
            //     cName: "sub-nav",
            // },
            {
                title: "Rooms",
                path: "/admin/rooms",
                icon: <MdIcons.MdOutlineHotel />,
            },
        ],
    },
    {
        title: "FAQ Editor",
        path: "/faq",
        icon: <IoIcons.IoMdHelpCircle />,
    },
    // {
    //     title: "Analytics",
    //     path: "/analytics",
    //     icon: <GrIcons.GrAnalytics />,
    // },
    {
        title: "Logout",
        path: "/logout",
        icon: <IoIcons.IoMdLogOut />,
    }
];
