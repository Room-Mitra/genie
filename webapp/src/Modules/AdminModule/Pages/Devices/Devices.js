
import { httpGet } from "../../../../Services/APIService";


const Devices = () => {

    const allDevices = httpGet('http://34.240.95.34:3000/devices');

    return (
        <div>
            <h1>Devices</h1>
        </div>
    );
}

export default Devices;