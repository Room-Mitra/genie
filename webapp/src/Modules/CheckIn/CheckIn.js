import React, { useState, useEffect } from 'react';
import { httpGet, httpPost } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";

const DEVICES_API_URI = '/devices';
const GUEST_API_URI = '/guests';

const CheckIn = () => {
    const [roomNumber, setRoomNumber] = useState('');
    const [allRoomNumbers, setAllRoomNumbers] = useState([]);
    const [guestPhoneNumber, setGuestPhoneNumber] = useState('');
    const [guestDetails, setGuestDetails] = useState(undefined);
    const [error, setError] = useState(null);
    const [isFetchingGuestDetails, setIsFetchingGuestDetails] = useState(null);


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

        const { guestData } = await httpGet(EC2_API_ENDPOINT + GUEST_API_URI + "/" + guestPhoneNumber)
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
        const resp = await httpPost(EC2_API_ENDPOINT + GUEST_API_URI, guestDetails)
        console.log(resp)
    };



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
                    {/* {guestDetails && (
                        <div>
                            <h3>Guest Details</h3>
                            <p>Name: {guestDetails.name}</p>
                            <p>Email: {guestDetails.email}</p>
                            <p>Phone Number: {guestDetails.phoneNumber}</p>
                        </div>
                    )} */}
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
                            {/* <label>
                                Phone Number:
                                <input type="text" value={guestDetails?.phoneNumber} onChange={(event) => setGuestDetails({ ...guestDetails, phoneNumber: event.target.value })} />
                            </label> */}
                            <button type="button" onClick={handleSaveGuestDetailsClick}>Save Guest Details</button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

export default CheckIn;