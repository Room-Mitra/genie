import React, { useState, useEffect } from 'react';
import { httpGet, httpPost } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { DateAndTimePicker } from "../../Common/DateTimePicker/DateAndTimePicker"

const DEVICES_API_URI = '?path=/devices';
const GUEST_API_URI = '?path=/guests';
const BOOKING_API_URI = '?path=/booking';

const CheckIn = () => {
    const [roomNumber, setRoomNumber] = useState('');
    const [allRoomNumbers, setAllRoomNumbers] = useState([]);
    const [guestPhoneNumber, setGuestPhoneNumber] = useState('');
    const [guestDetails, setGuestDetails] = useState(undefined);
    const [error, setError] = useState(null);
    const [isFetchingGuestDetails, setIsFetchingGuestDetails] = useState(null);

    const checkInTimeState = React.useState(new Date())

    useEffect(() => {
        getAllRoomsData()
    }, []);

    const getAllRoomsData = async () => {
        const allRoomsData = await httpGet(EC2_API_ENDPOINT + DEVICES_API_URI);
        const allRoomNumbers = allRoomsData.map(room => room.roomId);
        setAllRoomNumbers(allRoomNumbers);
    }

    const handleRoomNumberChange = (event) => {
        setRoomNumber(event.target.value);
    };

    const handleGuestPhoneNumberChange = (event) => {
        setGuestPhoneNumber(event.target.value);
    };

    const handleFetchGuestDetailsClick = async () => {
        if (!roomNumber || !guestPhoneNumber) {
            setError('Please enter both room number and guest phone number');
            return;
        }

        if (!allRoomNumbers.includes(roomNumber)) {
            setError('Invalid room number');
            return;
        }
        setError(null);
        setIsFetchingGuestDetails(true);

        const guestData = await httpGet(EC2_API_ENDPOINT + GUEST_API_URI + "/" + guestPhoneNumber)
        console.log("guestDetails :: ", guestData)
        setGuestDetails(guestData)
        setIsFetchingGuestDetails(false);
    };

    const handleSaveGuestDetailsClick = async () => {
        if (!guestDetails?.name || !guestDetails?.email) {
            setError('Please enter all guest details');
            return;
        }
        setError(null);
        guestDetails.id = guestPhoneNumber;
        const resp = await httpPost(EC2_API_ENDPOINT + GUEST_API_URI, guestDetails) //TODO:: everytime this is clicked, guest data is over ridden in DB.. needs to be a put, not a post
        console.log(resp) // show success/failure msg
    };

    const handleCheckInClick = async () => {
        if ((!roomNumber || !guestPhoneNumber || !guestDetails) || (!guestDetails?.name || !guestDetails?.email)) {
            setError('Please enter all guest details');
            return;
        }

        const [checkinTime] = checkInTimeState;
        console.log(roomNumber, guestPhoneNumber, guestDetails, checkinTime)
        const bookingDetails = {
            guestId: guestPhoneNumber,
            roomId: roomNumber,
            checkinTime: +checkinTime,
            guestName: guestDetails.name,
            guestEmail: guestDetails.email
        }
        const resp = await httpPost(EC2_API_ENDPOINT + BOOKING_API_URI, bookingDetails) //TODO:: everytime this is clicked, guest data is over ridden in DB.. needs to be a put, not a post
    }

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
            }}>Guest Check-in</h2>
            <form style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Room Number:
                    <input type="text" value={roomNumber} onChange={handleRoomNumberChange} style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                    Guest Phone Number:
                    <input type="text" value={guestPhoneNumber} onChange={handleGuestPhoneNumberChange} style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }} />
                </label>
                <button type="button" onClick={handleFetchGuestDetailsClick} style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                }}>Fetch Guest Details</button>
                {error && <p style={{ color: 'red', fontWeight: "bold", marginTop: "10px" }}>{error}</p>}
                {isFetchingGuestDetails && <p style={{ textAlign: "center", color: "#777" }}>Loading...</p>}
                <div>
                    {isFetchingGuestDetails === false && (
                        <div style={{ marginTop: "20px" }}>
                            <h3 style={{
                                textAlign: "center",
                                color: "#333",
                                marginBottom: "10px"
                            }}>Enter Guest Details</h3>
                            <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                                Name:
                                <input type="text" value={guestDetails?.name} onChange={(event) => setGuestDetails({ ...guestDetails, name: event.target.value })} style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px"
                                }} />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
                                Email:
                                <input type="email" value={guestDetails?.email} onChange={(event) => setGuestDetails({ ...guestDetails, email: event.target.value })} style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px"
                                }} />
                            </label>
                            <button type="button" onClick={handleSaveGuestDetailsClick} style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                padding: "10px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "14px",
                                marginTop: "10px"
                            }}>Save Guest Details</button>
                            <br />
                            <br />
                            <DateAndTimePicker dateTimeState={checkInTimeState} />
                            <br />
                            <br />
                            <button type="button" onClick={handleCheckInClick} style={{
                                backgroundColor: "#007BFF",
                                color: "white",
                                padding: "10px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}>Check In</button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

export default CheckIn;