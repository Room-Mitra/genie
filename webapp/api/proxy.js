import { EC2_API_ENDPOINT } from "../src/Constants/Environment.constants";

export default async function handler(req, res) {
    try {
        const response = await fetch(EC2_API_ENDPOINT + req, {
            method: req.method,
            headers: {
                ...req.headers,
                'Content-Type': 'application/json',
                host: undefined // avoid passing host header
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(response.status).send(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
}
