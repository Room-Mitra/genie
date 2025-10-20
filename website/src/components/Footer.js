import Image from 'next/image';

export default function Footer() {
  return (
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
  );
}
