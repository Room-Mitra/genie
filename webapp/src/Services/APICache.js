import HOTEL_CONSTANTS from "../Constants/Hotel.constants";

// cache.js
class Cache {
    static instance = null;

    constructor() {
        if (Cache.instance) {
            throw new Error('Cache is a singleton class. Use Cache.getInstance() to get the instance.');
        }
        this.cacheName = HOTEL_CONSTANTS.HOTEL_NAME + '-cache';
        this.ttl = 1 * 60 * 60 * 1000; // 1 hour in milli seconds
        Cache.instance = this;
    }

    async openCache() {
        if (!window.caches) {
            throw new Error('Cache API not supported');
        }
        return await window.caches.open(this.cacheName);
    }

    async get(url) {
        const cache = await this.openCache();
        const response = await cache.match(url);
        if (response) {
            const ttl = await this.getTTL(response);
            if (ttl > Date.now()) {
                return response.json();
            } else {
                await cache.delete(url);
            }
        }
        return null;
    }

    async put(url, response) {
        const cache = await this.openCache();
        const responseToCache = new Response(JSON.stringify(response.data), {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json',
                'X-TTL': (Date.now() + this.ttl).toString(),
            },
        });
        await cache.put(url, responseToCache);
    }

    async getTTL(response) {
        const headers = response.headers;
        const ttlHeader = headers.get('X-TTL');
        if (ttlHeader) {
            return parseInt(ttlHeader, 10);
        }
        return null;
    }

    static getInstance() {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }
}

const cacheInstance = Cache.getInstance();

export default cacheInstance;