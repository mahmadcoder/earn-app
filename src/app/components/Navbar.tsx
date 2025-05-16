"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const navbarLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <nav className="bg-black p-4 fixed w-full top-0 left-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/P3.jpg"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-md"
            />
            <span className="font-bold text-xl text-white">WatchEarn</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navbarLinks.map((link, index) => (
              <Link key={index} href={link.href} className="text-white hover:text-gray-400">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Auth Buttons or User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/deposit" className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400">
                Deposit
              </Link>
              <Link href="/withdraw" className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-400">
                Withdraw
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-white">{user?.name}</span>
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/registrationfom" className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400">
                Register
              </Link>
              <Link href="/button_login" className="text-white bg-gray-500 px-4 py-2 rounded hover:bg-gray-400">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black mt-4 p-4">
          {navbarLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-white hover:text-gray-400 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                href="/deposit"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Deposit
              </Link>
              <Link
                href="/withdraw"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Withdraw
              </Link>
              <div className="py-2 text-white">
                {user?.name}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/registrationfom"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                href="/button_login"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
