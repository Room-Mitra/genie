'use client';

import AgentWrapper from '@/src/components/AgentWrapper';

export default function WidgetClient() {
  return (
    <div className="min-h-screen flex items-stretch justify-center">
      <div className="w-full max-w-md mx-auto h-screen">
        <AgentWrapper />
      </div>
    </div>
  );
}
