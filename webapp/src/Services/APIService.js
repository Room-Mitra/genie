import axios from "axios";
import cacheInstance from "./APICache";

// Add Axios interceptor to include token in all requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`; // Add token to Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error); // Handle request errors
    }
);

export const httpGet = async (url, bypassBrowserCache = false, bypassServerCache = false) => {
    if (bypassBrowserCache) {
        const response = await httpGetUncached(url, bypassServerCache);
        return response.data;
    }

    const cachedValue = await cacheInstance.get(url);
    if (!cachedValue) {
        const response = await httpGetUncached(url, bypassServerCache);
        cacheInstance.put(url, response.data); // TODO: handle error in response);
        return response.data;
    }
    console.log("CACHED RESPONSE :: ", url, cachedValue);
    return cachedValue;
}

const httpGetUncached = async (url, bypassServerCache = false) => {
    if (bypassServerCache) {
        url += url.includes("?") ? "&bypassCache=true" : "?bypassCache=true";
    }
    const response = await axios.get(url);  // TODO: handle error
    console.log("API RESPONSE :: ", url, response);
    return response;
}

export const httpPut = async (url, data) => {
    const response = await axios.put(url, data);  // TODO: handle error
    console.log("API RESPONSE :: ", url, response);
    cacheInstance.delete(url);
    return response;
}


export const httpPost = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        console.log("API RESPONSE :: ", url, response);
        cacheInstance.delete(url);
        return response;
    } catch (err) {
        console.log("API ERROR :: ", url, err);
        return err;
    }
}