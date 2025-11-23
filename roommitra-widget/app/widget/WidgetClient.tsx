// import React from 'react';
// import '../../src/components/widget/globals.css'; // optional

"use client";


import dynamic from 'next/dynamic';

// AgentWrapper is a client component; dynamic import it with { ssr: false } 
const AgentWrapper = dynamic(() => import('../../src/components/AgentWrapper'), { ssr: false });

export const metadata = {
  title: 'Room Mitra Widget',
};

export default function WidgetClient() {
  // This page is the iframe target. Keep it minimal and full height.
  return (
    // <html lang="en">
    //   <body style={{ margin: 0, height: '100vh', background: '#0f172a' }}>
    <div style={{ height: '100vh', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, margin: 'auto', height: '100vh' }}>
        <AgentWrapper />
      </div>
    </div>
    //   </body>
    // </html>
  );
}
