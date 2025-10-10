'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const closeMenu = () => setOpen(false);

  const NavLinks = () => (
    <>
      <Link href="/#benefits" className="nav-link" onClick={closeMenu}>
        Benefits
      </Link>
      <Link href="/#features" className="nav-link" onClick={closeMenu}>
        Features
      </Link>
      <Link href="/blogs" className="nav-link" onClick={closeMenu}>
        Blogs
      </Link>
      <Link href="/#contact" className="nav-link" onClick={closeMenu}>
        Login
      </Link>

      <Link href="#contact" className="cta-btn px-6 py-3 bg-indigo-600 text-white rounded-lg">
        Request a Demo
      </Link>
    </>
  );

  return (
    <nav className="nav-bar bg-white/90 backdrop-blur shadow-sm fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            <Image
              src="/room-mitra-logo.png"
              alt="Room Mitra Logo"
              width={300}
              height={100}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle navigation menu"
            aria-controls="mobile-menu"
            aria-expanded={open ? 'true' : 'false'}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className={`h-6 w-6 ${open ? 'hidden' : 'block'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`h-6 w-6 ${open ? 'block' : 'hidden'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`md:hidden origin-top overflow-hidden transition-[max-height,opacity] duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-3 mb-3 rounded-xl border border-gray-100 bg-white shadow">
          <div className="flex flex-col px-4 py-2">
            <Link href="/#benefits" className="mobile-link" onClick={closeMenu}>
              Benefits
            </Link>
            <Link href="/#features" className="mobile-link" onClick={closeMenu}>
              Features
            </Link>
            <Link href="/blogs" className="mobile-link" onClick={closeMenu}>
              Blogs
            </Link>
            <Link href="/#contact" className="mobile-link" onClick={closeMenu}>
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Optional dim backdrop on mobile when menu open */}
      <div
        onClick={closeMenu}
        className={`md:hidden fixed inset-0 bg-black/30 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
    </nav>
  );
}
