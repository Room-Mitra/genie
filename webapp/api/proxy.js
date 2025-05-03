import { EC2_API_ENDPOINT } from "../src/Constants/Environment.constants";


import { Readable } from 'stream';


export const config = {
    api: {
        bodyParser: false // Let us manually parse body for proxying
    }
};


async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    if (!path) {
        return res.status(400).json({ error: 'Missing `path` query parameter' });
    }

    const query = new URLSearchParams(queryParams).toString();
    const targetUrl = `${EC2_API_ENDPOINT}${path}${query ? `?${query}` : ''}`;

    // Manually get raw body if not GET
    const rawBody = req.method !== 'GET' ? await getRawBody(req) : null;

    try {
        const proxyRes = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                host: undefined,
                'content-length': rawBody ? rawBody.length.toString() : undefined
            },
            body: rawBody
        });

        // Forward headers (optionally)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(proxyRes.status);

        // Pipe response body to the client
        const contentType = proxyRes.headers.get('content-type') || '';
        res.setHeader('Content-Type', contentType);

        const body = await proxyRes.arrayBuffer(); // works for both JSON and binary
        res.send(Buffer.from(body));
    } catch (err) {
        res.status(500).json({ error: 'Proxy error', details: err.message });
    }
}
