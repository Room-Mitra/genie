'use client';

import dynamic from 'next/dynamic';

const WebVoiceAgent = dynamic(() => import('../../components/WebVoiceAgent/Entry'), { ssr: false });


export default function WidgetClient() {
  return (
    <div className="min-h-screen flex items-stretch justify-center">
      <div className="w-full max-w-md mx-auto h-screen">
        <WebVoiceAgent />
      </div>
    </div>
  );
}
