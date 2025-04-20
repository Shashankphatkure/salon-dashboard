'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/auth';
import { getAppointments, getUserMembership, getUserCredits } from '../../lib/db';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [membership, setMembership] = useState(null);
  const [credits, setCredits] = useState({ points: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch pending appointments
        const appointmentsData = await getAppointments({ 
          status: 'pending'
        });
        setAppointments(appointmentsData);
        
        // Fetch user membership
        const membershipData = await getUserMembership(user.id);
        setMembership(membershipData);
        
        // Fetch user credits
        const creditsData = await getUserCredits(user.id);
        setCredits(creditsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    }
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Membership Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Membership</h2>
            {membership ? (
              <div>
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    <svg className="h-6 w-6 text-purple-700 dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Current Plan</p>
                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                      {membership.membership_plans?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Joined</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {new Date(membership.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Next Billing</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {new Date(membership.renewal_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href="/membership">
                    <button className="mt-3 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                      Manage Membership
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have an active membership.</p>
                <Link href="/membership">
                  <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                    Join a Membership Plan
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Credit Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Credits</h2>
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-green-700 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Available Points</p>
                <p className="font-semibold text-gray-800 dark:text-white">{credits?.points || 0} points</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Balance</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{credits?.balance || 0}</p>
            </div>
            <Link href="/credit">
              <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                View Credit History
              </button>
            </Link>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/book-appointment">
                <button className="w-full py-3 flex items-center justify-between text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg px-4 font-medium">
                  <span>Book Appointment</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/customers">
                <button className="w-full py-3 flex items-center justify-between text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg px-4 font-medium">
                  <span>Manage Customers</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/services">
                <button className="w-full py-3 flex items-center justify-between text-left bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg px-4 font-medium">
                  <span>View Services</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Pending Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pending Appointments</h2>
          
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(appointment.start_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{appointment.customer?.name || appointment.customer_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{appointment.customer?.phone || appointment.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {appointment.services?.map((s) => s.service?.name).join(', ') || 'No services specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{appointment.staff?.name || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No pending appointments found.</p>
              <Link href="/book-appointment">
                <button className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  Book an Appointment
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 