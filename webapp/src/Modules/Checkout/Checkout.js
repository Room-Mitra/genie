import { useEffect, useState } from "react";


import { httpGet } from "../../Services/APIService";
import { EC2_API_ENDPOINT } from "../../Constants/Environment.constants";

const DEVICES_API_URI = '/devices';

const CheckOut = () => {
    const [roomNumber, setRoomNumber] = useState('');
    const [allRoomNumbers, setAllRoomNumbers] = useState([]);

    const [error, setError] = useState(null);

    useEffect(() => {
        getAllRoomsData()
    }, []);



    const handleRoomNumberChange = (event) => {
        setRoomNumber(event.target.value);
        console.log("Room number ::", (event.target.value))
    };


    const getAllRoomsData = async () => {
        const allRoomsData = await httpGet(EC2_API_ENDPOINT + DEVICES_API_URI);
        const allRoomNumbers = allRoomsData.map(room => room.roomId);
        setAllRoomNumbers(allRoomNumbers);
    }


    const handleGuestCheckOut = () => {

    }

    return (
        <div>
            <h2>Guest Check-Out</h2>
            <label>
                Room Number:
                <input type="text" value={roomNumber} onChange={handleRoomNumberChange} />
            </label>

            <button type="button" onClick={handleGuestCheckOut}>CHECK OUT</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );


}


export default CheckOut;

