import { BookOpenIcon, UsersIcon } from "@heroicons/react/24/outline";
import * as Icons from "../icons";
import { BedDoubleIcon, HotelIcon, LineChartIcon } from "lucide-react";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: LineChartIcon,
        url: "/",
        items: [],
      },
      {
        title: "Requests",
        icon: Icons.Bell,
        items: [
          {
            title: "Active",
            url: "/requests/active",
          },
          {
            title: "Completed",
            url: "/requests/completed",
          },
        ],
      },
      {
        title: "Bookings",
        icon: BookOpenIcon,
        items: [
          {
            title: "Active",
            url: "/bookings/active",
          },
          {
            title: "Upcoming",
            url: "/bookings/upcoming",
          },
          {
            title: "Past",
            url: "/bookings/past",
          },
          {
            title: "+ New Booking",
            url: "/bookings/new",
          },
        ],
      },
      {
        title: "Rooms",
        icon: BedDoubleIcon,
        items: [],
        url: "/rooms/all",
      },
      {
        title: "Staff",
        icon: UsersIcon,
        items: [],
        url: "/staff/all",
      },
      {
        title: "Hotel",
        icon: HotelIcon,
        items: [
          {
            title: "Info",
            url: "/hotel/info",
          },
          {
            title: "Amenities",
            url: "/hotel/amenities",
          },
          {
            title: "Concierge",
            url: "/hotel/concierge",
          },
          {
            title: "Restaurant Menu",
            url: "/hotel/restaurant-menu",
          },
        ],
      },

      //     {
      //       title: "Forms",
      //       icon: Icons.Alphabet,
      //       items: [
      //         {
      //           title: "Form Elements",
      //           url: "/forms/form-elements",
      //         },
      //         {
      //           title: "Form Layout",
      //           url: "/forms/form-layout",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Tables",
      //       url: "/tables",
      //       icon: Icons.Table,
      //       items: [
      //         {
      //           title: "Tables",
      //           url: "/tables",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Pages",
      //       icon: Icons.Alphabet,
      //       items: [
      //         {
      //           title: "Settings",
      //           url: "/pages/settings",
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   label: "OTHERS",
      //   items: [
      //     {
      //       title: "Charts",
      //       icon: Icons.PieChart,
      //       items: [
      //         {
      //           title: "Basic Chart",
      //           url: "/charts/basic-chart",
      //         },
      //       ],
      //     },
      //     {
      //       title: "UI Elements",
      //       icon: Icons.FourCircle,
      //       items: [
      //         {
      //           title: "Alerts",
      //           url: "/ui-elements/alerts",
      //         },
      //         {
      //           title: "Buttons",
      //           url: "/ui-elements/buttons",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Authentication",
      //       icon: Icons.Authentication,
      //       items: [
      //         {
      //           title: "Sign In",
      //           url: "/auth/sign-in",
      //         },
      //       ],
      //     },
    ],
  },
];
