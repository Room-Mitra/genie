'use client';

import { useEffect, useMemo, useState } from 'react';
import { Agent } from './Agent';
import { LeadForm } from './LeadForm';
import { OTPForm } from './OTPForm';

function parseQuery() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const hotelId = params.get('hotelId') || params.get('hotel_id') || '';
  const theme = params.get('theme') ? JSON.parse(decodeURIComponent(params.get('theme'))) : null;
  const token = params.get('token') || '';
  const position = params.get('position') || 'bottom-right';
  return { hotelId, theme, token, position };
}

export default function AgentWrapper(props) {
  const initialQuery = useMemo(() => parseQuery(), []);

  const [config, setConfig] = useState({
    hotelId: initialQuery.hotelId || '',
    theme: initialQuery.theme || { primary: '#0ea5a4', background: '#0f172a' },
    token: initialQuery.token || '',
    position: initialQuery.position || 'bottom-right',
  });

  const [stage, setStage] = useState('lead'); // "lead" | "otp" | "agent"
  const [leadData, setLeadData] = useState(null); // { email, name, language }
  const [authToken, setAuthToken] = useState('');

  // Let inner components close the whole popup (iframe)
  const handleCloseWidget = () => {
    // Reset local state so next open starts fresh
    setStage('lead');
    setLeadData(null);
    setAuthToken('');

    if (typeof window !== 'undefined') {
      window.parent?.postMessage({ type: 'ROOMMITRA_CLOSE_WIDGET' }, '*');
    }
  };

  // Listen for embed postMessage config overrides
  useEffect(() => {
    function onMessage(ev) {
      try {
        const msg = ev.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'ROOMMITRA_INIT') {
          setConfig((prev) => ({ ...prev, ...(msg.payload || {}) }));
        }
      } catch (e) {
        console.warn('AgentWrapper onMessage error', e);
      }
    }
    window.addEventListener('message', onMessage, false);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Error if hotelId missing
  if (!config.hotelId) {
    return (
      <div className="h-full bg-neutral-950 text-white font-sans p-5">
        <h3 className="text-lg font-semibold">Room Mitra Widget</h3>
        <p className="mt-2 text-sm text-white/80">
          Missing hotel configuration. Provide{' '}
          <code className="font-mono bg-white/10 px-1 py-0.5 rounded">hotelId</code>.
        </p>
      </div>
    );
  }

  // ------- RENDER FLOW --------

  if (stage === 'lead') {
    return (
      <LeadForm
        onClose={handleCloseWidget}
        onSuccess={({ email, name, language }) => {
          setLeadData({ email, name, language });
          setStage('otp');
        }}
      />
    );
  }

  if (stage === 'otp') {
    return (
      <OTPForm
        email={leadData.email}
        name={leadData.name}
        language={leadData.language}
        onClose={handleCloseWidget}
        onSuccess={({ token }) => {
          setAuthToken(token);
          setStage('agent');
        }}
      />
    );
  }

  if (stage === 'agent') {
    return <Agent token={authToken || config.token} onClose={handleCloseWidget} />;
  }

  return null;
}
