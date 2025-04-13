'use client';

import { useState } from 'react';
import Link from 'next/link';
import CustomersList from '../components/CustomersList';
import SalonLayout from '../components/SalonLayout';

export default function CustomersPage() {
  const [currentPage, setCurrentPage] = useState('customers');

  return (
    <SalonLayout currentPage="customers">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              View, add, and manage your salon customers
            </p>
          </div>
          
          <CustomersList />
        </div>
      </div>
    </SalonLayout>
  );
} 