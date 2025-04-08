import React, { useState, useEffect } from 'react';
import { httpGet, httpPost } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";
import { DateAndTimePicker } from "../../Common/DateTimePicker/DateAndTimePicker"


const DEVICES_API_URI = '/devices';
const GUEST_API_URI = '/guests';
const BOOKING_API_URI = '/booking';

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
        console.log(guestDetails)
        if (`${guestDetails.name}` === "" || `${guestDetails.email}` === "") {
            setError('Please enter all guest details');
            return;
        }
        setError(null);
        guestDetails.id = guestPhoneNumber;
        const resp = await httpPost(EC2_API_ENDPOINT + GUEST_API_URI, guestDetails) //TODO:: everytime this is clicked, guest data is over ridden in DB.. needs to be a put, not a post
        console.log(resp) // show success/failure msg
    };

    const handleCheckInClick = async () => {
        if ((!roomNumber || !guestPhoneNumber || !guestDetails) || (`${guestDetails.name}` === "" || `${guestDetails.email}` === "")) {
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
        <div>
            <h2>Guest Check-in</h2>
            <form>
                <label>
                    Room Number:
                    <input type="text" value={roomNumber} onChange={handleRoomNumberChange} />
                </label>
                <label>
                    Guest Phone Number:
                    <input type="text" value={guestPhoneNumber} onChange={handleGuestPhoneNumberChange} />
                </label>
                <button type="button" onClick={handleFetchGuestDetailsClick}>Fetch Guest Details</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {isFetchingGuestDetails && <p>Loading...</p>}
                <div>
                    {isFetchingGuestDetails === false && (
                        <div>
                            <h3>Enter Guest Details</h3>
                            <label>
                                Name:
                                <input type="text" value={guestDetails?.name} onChange={(event) => setGuestDetails({ ...guestDetails, name: event.target.value })} />
                            </label>
                            <label>
                                Email:
                                <input type="email" value={guestDetails?.email} onChange={(event) => setGuestDetails({ ...guestDetails, email: event.target.value })} />
                            </label>
                            <button type="button" onClick={handleSaveGuestDetailsClick}>Save Guest Details</button>
                            <br />
                            <br />
                            <br />
                            <DateAndTimePicker dateTimeState={checkInTimeState} />
                            <br />
                            <br />
                            <button type="button" onClick={handleCheckInClick}>Check In</button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

export default CheckIn;