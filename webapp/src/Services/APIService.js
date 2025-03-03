import axios from "axios";
import cacheInstance from "./APICache";

export const httpGet = async (url, bypassCache = false) => {
    if (bypassCache) {
        const response = await httpGetUncached(url);
        return response.data;
    }

    const cachedValue = await cacheInstance.get(url);
    if (!cachedValue) {
        const response = await httpGetUncached(url);
        cacheInstance.put(url, response.data); // TODO: handle error in response);
        return response.data;
    }
    console.log("CACHED RESPONSE :: ", url, cachedValue);
    return cachedValue;
}

export const httpGetUncached = async (url, bypassCache = false) => {
    const response = await axios.get(url);
    console.log("API RESPONSE :: ", url, response);
    return response;
}