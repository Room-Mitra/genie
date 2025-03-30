import React, { useState, useEffect } from 'react';
import { httpGet, httpPut } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";

const DEVICES_API_URI = '/devices';

const CheckIn = () => {
    const [roomNumber, setRoomNumber] = useState('');
    const [allRoomNumbers, setAllRoomNumbers] = useState([]);
    const [guestPhoneNumber, setGuestPhoneNumber] = useState('');
    const [guestDetails, setGuestDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isFetchingGuestDetails, setIsFetchingGuestDetails] = useState(false);


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
        console.log("Room number ::", (event.target.value))
    };

    const handleGuestPhoneNumberChange = (event) => {
        setGuestPhoneNumber(event.target.value);
        console.log("Guest phone number ::", (event.target.value))

    };

    const handleFetchGuestDetailsClick = () => {
        if (!roomNumber || !guestPhoneNumber) {
            setError('Please enter both room number and guest phone number');
            return;
        }

        if (!allRoomNumbers.includes(roomNumber)) {
            setError('Invalid room number');
            return;
        }

        // setIsFetchingGuestDetails(true);
        // httpGet(`/api/guest-details?roomNumber=${roomNumber}&phoneNumber=${guestPhoneNumber}`)
        //     .then(response => {
        //         if (response.data) {
        //             setGuestDetails(response.data);
        //         } else {
        //             setGuestDetails({});
        //         }
        //         setIsFetchingGuestDetails(false);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //         setIsFetchingGuestDetails(false);
        //     });
    };

    const handleSaveGuestDetailsClick = () => {
        // Save guest details to API
        httpPut('/api/guest-details', guestDetails)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error(error);
            });
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
                    {guestDetails && (
                        <div>
                            <h3>Guest Details</h3>
                            <p>Name: {guestDetails.name}</p>
                            <p>Email: {guestDetails.email}</p>
                            <p>Phone Number: {guestDetails.phoneNumber}</p>
                        </div>
                    )}
                    {!guestDetails && (
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
                            <label>
                                Phone Number:
                                <input type="text" value={guestDetails?.phoneNumber} onChange={(event) => setGuestDetails({ ...guestDetails, phoneNumber: event.target.value })} />
                            </label>
                            <button onClick={handleSaveGuestDetailsClick}>Save Guest Details</button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

export default CheckIn;