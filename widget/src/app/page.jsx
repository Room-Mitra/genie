import Image from 'next/image';
import logo from '@/public/images/roommitra-logo.svg';
import Script from 'next/script';

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-32 px-16 sm:items-start">
        <Image src={logo} alt="logo" width={250} height={250} className="my-12" />

        {/* 👇 This is where the widget iframe will be rendered */}
        <div data-roommitra-callback-anchor className="w-full " />

        {/* Request Callback */}
        <Script
          src="/request-callback.js"
          data-hotel-id="ROOMMITRA"
          strategy="afterInteractive"
          data-height="275"
        />

        {/* Vaani - Chat Bot */}
        <Script
          src="/web-voice-agent.js"
          data-hotel-id={process.env.NEXT_PUBLIC_DEMO_HOTEL_ID}
          data-signature={process.env.NEXT_PUBLIC_DEMO_WIDGET_SIGNATURE}
          strategy="afterInteractive"
        />
      </main>
    </div>
  );
}
