import axios from "axios";
import cacheInstance from "./APICache";

export const httpGet = async (url, bypassCache = false) => {
    if (bypassCache) {
        return httpGetUncached(url);
    }

    const cachedValue = await cacheInstance.get(url);
    if (!cachedValue) {
        const response = await httpGetUncached(url);
        cacheInstance.put(url, response); // TODO: handle error in response);
        return response;
    }
    console.log("CACHED RESPONSE :: ", url, cachedValue);
    return cachedValue;
}

export const httpGetUncached = async (url, bypassCache = false) => {
    const response = await axios.get(url);
    console.log("API RESPONSE :: ", url, response);
    return response;
}