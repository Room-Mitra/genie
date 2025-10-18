import Navbar from '../components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="header text-center py-20 bg-indigo-50">
          <h1 className="text-4xl md:text-4xl font-bold pt-20">
            In-room Voice Assistant for Hotel Rooms
          </h1>
          <p className="mt-4 text-lg">
            Elevate guest experience and streamline operations with Room Mitra
          </p>
          <Link
            href="/#request-a-demo"
            className="cta-btn mt-6 mb-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Request a Demo
          </Link>
        </section>

        {/* Benefits for Hotels */}
        <section id="benefits" className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Benefits for Hotels</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🛎️</p>
              <h3 className="font-semibold text-xl p-2">Guest Convenience</h3>
              <p className="mt-2 text-gray-600">
                24/7 voice & text based instant assistance and multi-language support to wow every
                guest.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🌟</p>
              <h3 className="font-semibold text-xl p-2">Guest Delight</h3>
              <p className="mt-2 text-gray-600">
                Music, News, Weather, Games and much much more to turn rooms into entertainment
                centers.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">⚡</p>
              <h3 className="font-semibold text-xl p-2">Operational Efficiency</h3>
              <p className="mt-2 text-gray-600">
                Automate routine queries and requests so your staff can focus on what matters –
                hospitality.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">💹</p>
              <h3 className="font-semibold text-xl p-2">Revenue Growth</h3>
              <p className="mt-2 text-gray-600">
                Upsell hotel services, promote offers, and capture more bookings through seamless
                guest engagement.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🎯</p>
              <h3 className="font-semibold text-xl p-2">Deep Personalisation</h3>
              <p className="mt-2 text-gray-600">
                Tailor guest experiences with personalized recommendations, preferences, and
                services to create unforgettable stays.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">📊</p>
              <h3 className="font-semibold text-xl">Dashboard and Reports</h3>
              <p className="mt-2 text-gray-600">
                Gain actionable insights with real-time analytics and detailed reports to make
                data-driven decisions for your hotel.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 max-w-6xl mx-auto px-12 features-section">
          <h2 className="text-3xl font-bold text-center">Features</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🗣️</p>
              <h3 className="font-semibold text-xl">Voice Ordering</h3>
              <p className="mt-2">Guests can order food or request services using voice.</p>
            </div>
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">💬</p>
              <h3 className="font-semibold text-xl">WhatsApp Chatbot</h3>
              <p className="mt-2">
                24/7 chat support for guests – book amenities, ask queries, and get instant
                responses on WhatsApp.
              </p>
            </div>
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🕐</p>
              <h3 className="font-semibold text-xl">24x7 Support</h3>
              <p className="mt-2">
                Never miss a guest request. Our AI handles routine support so you always deliver
                5-star service.
              </p>
            </div>
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">📱</p>
              <h3 className="font-semibold text-xl">Digital Check-In and Check-Out</h3>
              <p className="mt-2">
                Simplify the guest experience with seamless digital check-in and check-out, reducing
                wait times and enhancing convenience.
              </p>
            </div>
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">💡</p>
              <h3 className="font-semibold text-xl">Voice-Controlled Electronics</h3>
              <p className="mt-2">
                Guests can control room electronics like lights, curtains, and thermostats using
                simple voice commands for a smarter stay.
              </p>
            </div>
            <div className="feature-item p-6 bg-white shadow rounded-lg text-center">
              <p className="text-2xl p-2">🎺</p>
              <h3 className="font-semibold text-xl">Entertainment Hub</h3>
              <p className="mt-2">
                Guests can play music, check the weather, and plan their day – all hands-free using
                voice commands for a personalized experience.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 bg-gray-100 text-center">
          <h2 className="text-3xl font-bold">Request a Demo</h2>
          {/* Request demo form */}
          <p className="mt-4 max-w-2xl mx-auto">
            Interested in transforming your hotel with Room Mitra? Fill out the form below to
            schedule a personalized demo and see how our in-room voice assistant can elevate your
            guest experience.
          </p>
          <form
            action="https://formspree.io/f/mayvldwp"
            method="POST"
            className="mt-8 max-w-xl mx-auto bg-white p-6 rounded-lg shadow"
          >
            <div className="mb-4 text-left">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4 text-left">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4 text-left">
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4 text-left">
              <label htmlFor="hotel" className="block text-gray-700 font-semibold mb-2">
                Hotel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="hotel"
                name="hotel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4 text-left">
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="cta-btn px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>

            {/* Form submitted message */}
            <div className="mt-4 text-center">
              <p>Thank you! We&apos;ll get in touch soon.</p>
            </div>
          </form>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-6 text-center rounded-t-xl">
        <div>
          <Image
            src="/room-mitra-logo.png"
            alt="Room Mitra Logo"
            width={300}
            height={100}
            className="mx-auto mb-4 h-8 w-auto"
          />

          <p className="my-4">
            Email: <a href="mailto:info@roommitra.com">info@roommitra.com</a> | Phone:{' '}
            <a href="tel:+919886653557">+91-9886653557</a>
          </p>
        </div>
        © {new Date().getFullYear()} Room Mitra. All rights reserved.
      </footer>
    </>
  );
}
