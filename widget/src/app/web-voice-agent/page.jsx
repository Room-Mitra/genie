import { headers } from 'next/headers';
import WebVoiceAgent from '@/src/components/WebVoiceAgent/Entry';

export default async function WidgetPage({ searchParams }) {
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const origin = headersList.get('origin') || '';

  const sp = await searchParams;
  const hotelId = sp?.hotelId || '';
  const signature = sp?.signature || '';
  const theme = sp?.theme || '';
  const position = sp?.position || '';

  try {
    const endpoint = `${process.env.API_BASE_URL}/widget/init`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelId,
        signature,
        referer,
        origin,
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => '');
      throw new Error(e?.error || `Request failed with ${res.status}`);
    }
  } catch (err) {
    console.error('voice-agent error', err);
    throw new Error(err?.error || 'Something went wrong');
  }

  return (
    <div className="min-h-screen flex items-stretch justify-center">
      <div className="w-full max-w-md mx-auto h-screen">
        <WebVoiceAgent hotelId={hotelId} theme={theme} position={position} />
      </div>
    </div>
  );
}
