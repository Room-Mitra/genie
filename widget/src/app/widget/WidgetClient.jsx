'use client';

import dynamic from 'next/dynamic';

const AgentWrapper = dynamic(() => import('../../components/WebVoiceAgent/AgentWrapper'), { ssr: false });


export default function WidgetClient() {
  return (
    <div className="min-h-screen flex items-stretch justify-center">
      <div className="w-full max-w-md mx-auto h-screen">
        <AgentWrapper />
      </div>
    </div>
  );
}
