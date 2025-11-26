import Image from 'next/image';
import logo from '@/public/images/roommitra-logo.svg';
import Script from 'next/script';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image src={logo} alt="logo" width={'250'} height={'250'} />

        {/* Room Mitra Support Widget */}
        <Script src={'/web-voice-agent.js'} data-hotel-id="ROOMMITRA" strategy="afterInteractive" />
      </main>
    </div>
  );
}
