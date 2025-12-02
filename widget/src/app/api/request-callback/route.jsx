import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { hotelId, phone, country } = body;

    if (!hotelId || !phone) {
      return NextResponse.json({ error: 'Missing hotelId or phone' }, { status: 400 });
    }

    console.log('Callback request:', { hotelId, phone, country });

    const endpoint = `${process.env.API_BASE_URL}/widget/request-callback`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => '');
      throw new Error(e?.error || `Request failed with ${res.status}`);
    }

    return NextResponse.json(await res.json().catch(() => ({})));
  } catch (err) {
    console.error('Callback request error', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong. Please try again' },
      { status: 500 }
    );
  }
}
