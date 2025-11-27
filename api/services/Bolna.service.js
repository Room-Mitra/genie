const BOLNA_TOKEN = process.env.BOLNA_TOKEN;
if (!BOLNA_TOKEN) throw new Error('Bolna token not set');

export async function requestCallback(phoneNumber) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', `Bearer ${BOLNA_TOKEN}`);

  const raw = JSON.stringify({
    agent_id: 'b3b851d3-516a-430f-a68a-eca41f8b747f',
    recipient_phone_number: phoneNumber,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  const res = await fetch('https://api.bolna.ai/call', requestOptions);

  if (!res.ok) {
    const err = (await res).json().catch(() => ({}));
    throw new Error(err.error || 'error calling bolna api');
  }

  return await res.json();
}
