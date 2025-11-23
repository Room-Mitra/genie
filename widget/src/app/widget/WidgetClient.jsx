'use client';

import dynamic from 'next/dynamic';

const AgentWrapper = dynamic(() => import('../../components/AgentWrapper'), { ssr: false });

export const metadata = {
  title: 'Room Mitra Widget',
};

export default function WidgetClient() {
  return (
    <div
      style={{ height: '100vh', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}
    >
      <div style={{ width: '100%', maxWidth: 420, margin: 'auto', height: '100vh' }}>
        <AgentWrapper />
      </div>
    </div>
  );
}
