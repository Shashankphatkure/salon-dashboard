'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';

export default function Navbar() {
  return (
    <header className="p-6 flex items-center justify-between border-b bg-white dark:bg-gray-800 shadow-sm">
      <Link href="/">
        <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-300">Shashank's Salon</h1>
      </Link>
      
      <nav className="hidden md:flex gap-6">
        <Link href="/" className="font-medium text-purple-600 dark:text-purple-300">Home</Link>
        <Link href="/book-appointment" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Book Appointment</Link>
        <Link href="/services" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Services</Link>
        <Link href="/staff" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Staff</Link>
        <Link href="/customers" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Customers</Link>
        <Link href="/membership" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Membership</Link>
        <Link href="/credit" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Credit</Link>
        <Link href="/dashboard" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Dashboard</Link>
        <Link href="/reports" className="font-medium hover:text-purple-600 dark:hover:text-purple-300">Reports</Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
} 