import Head from 'next/head';
import Footer from './ui/Footer';
import Navbar from './ui/Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Room Mitra</title>
        <meta
          name="description"
          content="Handle phone bookings, guest queries, and in-room service requests with a single intelligent voice agent. No hold times, no missed calls, no operational chaos."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
