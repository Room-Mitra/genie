import axios from "axios";

export const httpGet = async (url) => {
    const response = await axios.get(url);
    console.log(response);
    return response;
}