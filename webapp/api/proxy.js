import { EC2_API_ENDPOINT } from "../src/Constants/Environment.constants";
export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    if (!path) {
        return res.status(400).json({
            error: 'Missing `path` query parameter!!!',
            req: req.query
        });
    }

    // Build full target URL
    const query = new URLSearchParams(queryParams).toString();
    const targetUrl = `${EC2_API_ENDPOINT}${path}${query ? `?${query}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                host: undefined // prevent sending Vercel's host header
            },
            body: req.body  //req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
        });

        // const contentType = response.headers.get('content-type');
        // const data = contentType?.includes('application/json') ? await response.json() : await response.text();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(response.status).send(response);
    } catch (error) {
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
}
