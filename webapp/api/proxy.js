import { EC2_API_ENDPOINT } from "../src/Constants/Environment.constants";

export const config = {
    api: {
        bodyParser: false
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
        return res.status(400).json({ error: 'Missing `path` query parameter', m: req.query });
    }

    const query = new URLSearchParams(queryParams).toString();
    const targetUrl = `${EC2_API_ENDPOINT}${path}${query ? `?${query}` : ''}`;

    const test = await fetch('https://jsonplaceholder.typicode.com/todos/1');

    res.status(500).json({ error: 'Proxy failed!!', test });

    try {
        const rawBody = req.method !== 'GET' ? await getRawBody(req) : null;
        const proxyRes = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                host: undefined,
                'content-length': rawBody ? rawBody.length.toString() : undefined
            },
            body: rawBody
        });

        const contentType = proxyRes.headers.get('content-type') || '';
        const buffer = Buffer.from(await proxyRes.arrayBuffer());

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);
        res.status(proxyRes.status).send(buffer);
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy failed', details: err.message });
    }
}
