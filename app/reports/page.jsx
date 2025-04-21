'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import Navbar from '../components/Navbar';

// Mock data for demonstration
const membershipStats = {
  totalMembers: 184,
  activeMembers: 172,
  newMembersThisMonth: 14,
  membersByPlan: {
    gold: 54,
    silverPlus: 78,
    silver: 52
  },
  retentionRate: 92
};

const revenueStats = {
  thisMonth: 187500,
  lastMonth: 162000,
  growth: 15.7,
  totalPointsIssued: 84500,
  totalPointsRedeemed: 62700,
  averageServiceValue: 3200
};

const topServices = [
  { name: 'Hair Color', count: 78, revenue: 312000 },
  { name: 'Full Body Massage', count: 65, revenue: 325000 },
  { name: 'Facial', count: 112, revenue: 280000 },
  { name: 'Bridal Package', count: 8, revenue: 200000 },
  { name: 'Hair Cut & Style', count: 145, revenue: 217500 }
];

export default function Reports() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if user has admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/reports');
      } else {
        setLoading(false);
        // Always show password modal for any authenticated user
        setShowPasswordModal(true);
      }
    }
  }, [user, authLoading, router]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Simple password check - in a real app, this would be a more secure check
    if (password === 'admin123') {
      setAuthorized(true);
      setShowPasswordModal(false);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Reports Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Enter the admin password to view reports.
          </p>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter admin password"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Access Reports
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!authorized) {
    // This shouldn't happen but just in case
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Salon Reports</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View analytics and statistics for your salon's performance and membership.
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md font-medium">
              Generate Report
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 text-sm">
              Export PDF
            </button>
            <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 text-sm">
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Members</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{membershipStats.totalMembers}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 font-medium">+{membershipStats.newMembersThisMonth} new</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">this month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">₹{revenueStats.thisMonth.toLocaleString()}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 font-medium">+{revenueStats.growth}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Points Issued</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{revenueStats.totalPointsIssued.toLocaleString()}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-purple-500 font-medium">{revenueStats.totalPointsRedeemed.toLocaleString()} redeemed</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">({Math.round(revenueStats.totalPointsRedeemed/revenueStats.totalPointsIssued*100)}%)</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Retention Rate</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{membershipStats.retentionRate}%</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 font-medium">Excellent</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">industry avg: 65%</span>
            </div>
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Membership Distribution</h3>
            <div className="flex items-center justify-center h-64">
              <div className="flex w-full max-w-md">
                {/* Gold */}
                <div className="relative w-full" style={{ width: `${(membershipStats.membersByPlan.gold / membershipStats.totalMembers) * 100}%` }}>
                  <div className="h-8 bg-amber-500 rounded-l-full"></div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Gold</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{membershipStats.membersByPlan.gold} members</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((membershipStats.membersByPlan.gold / membershipStats.totalMembers) * 100)}%
                    </p>
                  </div>
                </div>
                
                {/* Silver Plus */}
                <div className="relative w-full" style={{ width: `${(membershipStats.membersByPlan.silverPlus / membershipStats.totalMembers) * 100}%` }}>
                  <div className="h-8 bg-purple-500"></div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Silver Plus</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{membershipStats.membersByPlan.silverPlus} members</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((membershipStats.membersByPlan.silverPlus / membershipStats.totalMembers) * 100)}%
                    </p>
                  </div>
                </div>
                
                {/* Silver */}
                <div className="relative w-full" style={{ width: `${(membershipStats.membersByPlan.silver / membershipStats.totalMembers) * 100}%` }}>
                  <div className="h-8 bg-gray-500 rounded-r-full"></div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Silver</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{membershipStats.membersByPlan.silver} members</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((membershipStats.membersByPlan.silver / membershipStats.totalMembers) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Top Services by Revenue</h3>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-medium mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">{service.name}</h4>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{service.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(service.revenue / 350000) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service.count} services performed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">Monthly Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 72, 86, 81, 90, 87, 94, 88, 95, 85, 91, 97].map((height, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-purple-500 rounded-t-sm transition-all duration-300 hover:bg-purple-600" 
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              View Member Dashboard
            </button>
          </Link>
          <Link href="/services">
            <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg">
              Manage Services
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-20 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Hair & Care Unisex Salon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 