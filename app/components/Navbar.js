'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserMenu from './UserMenu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Menu items in the specified sequence
  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/book-appointment', label: 'Book An Appointment' },
    { href: '/services', label: 'Service' },
    { href: '/staff', label: 'Staff' },
    { href: '/customers', label: 'Customers' },
    { href: '/membership', label: 'Membership' },
    { href: '/credit', label: 'Credit' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/invoice', label: 'Invoice' },
    { href: '/products', label: 'Products' },
    { href: '/reports', label: 'Reports' }
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="p-4 md:p-6 flex items-center justify-between border-b bg-white dark:bg-gray-800 shadow-sm relative z-20">
      <Link href="/dashboard" className="flex items-center gap-2">
        <img src="/logo.png" alt="Salon Logo" className="h-8 w-8" />
        <h2 className="text-xs md:text-xl font-bold text-purple-800 dark:text-purple-300">Hair & Care Unisex Salon</h2>
      </Link>
      
      {/* Desktop menu */}
      <nav className="hidden lg:flex gap-4 xl:gap-6">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            href={item.href} 
            className={`font-medium hover:text-purple-600 dark:hover:text-purple-300 transition ${
              item.href === '/' ? 'text-purple-600 dark:text-purple-300' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      {/* Mobile menu button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMenu}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        <UserMenu />
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-md lg:hidden z-10">
          <div className="py-2 px-4 space-y-2">
            {menuItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 px-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 