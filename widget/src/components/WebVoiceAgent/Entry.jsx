'use client';

import { useState } from 'react';
import { Agent } from './Agent';
import { LeadForm } from './LeadForm';
import { OTPForm } from './OTPForm';

export default function WebVoiceAgent({ hotelId, theme, position }) {
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

  // Error if hotelId missing
  if (!hotelId) {
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
        hotelId={hotelId}
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
        hotelId={hotelId}
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
    return <Agent token={authToken} onClose={handleCloseWidget} />;
  }

  return null;
}
