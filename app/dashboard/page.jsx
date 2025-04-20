'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import PageTitle from '../components/PageTitle';
import { useAuth } from '../../lib/auth';
import { 
  getAppointments, 
  getCustomers, 
  getServices, 
  getStaff,
  getUserMembership,
  getMembershipPlans,
  getSalesReport 
} from '../../lib/db';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [memberships, setMemberships] = useState({ total: 0, active: 0 });
  const [customers, setCustomers] = useState({ total: 0, new: 0 });
  const [services, setServices] = useState({ total: 0, booked: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
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
        
        // Fetch appointments
        const appointmentsData = await getAppointments({ 
          status: 'pending',
          limit: 5
        });
        setAppointments(appointmentsData);
        
        // Fetch membership stats
        const membershipPlans = await getMembershipPlans();
        const activeMembershipsCount = membershipPlans.reduce((acc, plan) => 
          acc + (plan.active_count || 0), 0);
        
        setMemberships({ 
          total: membershipPlans.reduce((acc, plan) => acc + (plan.total_count || 0), 0), 
          active: activeMembershipsCount 
        });
        
        // Fetch customer stats
        const customersData = await getCustomers();
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const newCustomersThisMonth = customersData.filter(customer => 
          new Date(customer.created_at) >= firstDayOfMonth
        );
        
        setCustomers({ 
          total: customersData.length, 
          new: newCustomersThisMonth.length 
        });
        
        // Fetch service stats
        const servicesData = await getServices();
        const bookedServices = await getSalesReport(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
        
        setServices({ 
          total: servicesData.length, 
          booked: bookedServices.reduce((acc, item) => acc + (item.service_count || 0), 0)
        });
        
        // Fetch recent activity
        const recentAppointments = appointmentsData.slice(0, 3);
        setRecentActivity(recentAppointments.map(appt => ({
          type: 'appointment',
          data: appt,
          timestamp: new Date(appt.created_at || appt.date)
        })));
        
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

  // Calculate time since for activity
  const getTimeSince = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
        <PageTitle 
          title="Dashboard" 
          description="Overview of salon performance, appointments, and statistics"
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Memberships Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-purple-700 dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Memberships</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{memberships.total}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium">{memberships.active} active</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({memberships.total > 0 ? Math.round(memberships.active/memberships.total*100) : 0}%)
              </span>
            </div>
          </div>
          
          {/* Customers Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-blue-700 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{customers.total}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium">{customers.new} new this month</span>
            </div>
          </div>
          
          {/* Services Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-amber-700 dark:text-amber-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Services</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{services.total}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-500 font-medium">{services.booked} booked this month</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/book-appointment">
                <button className="w-full py-2 flex items-center justify-between text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg px-3 text-sm font-medium">
                  <span>Book Appointment</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/customers">
                <button className="w-full py-2 flex items-center justify-between text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg px-3 text-sm font-medium">
                  <span>Add Customer</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.customer?.name || appointment.customer_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.customer?.phone || appointment.customer_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {appointment.appointment_services?.map((s, i) => (
                            <span key={i}>
                              {s.service?.name || s.service_name}
                              {i < appointment.appointment_services.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.staff?.name || appointment.staff_name || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/appointments/${appointment.id}`}>
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">
                            View
                          </button>
                        </Link>
                        <button 
                          onClick={() => window.location.href = `/invoice/create?appointment=${appointment.id}`}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No pending appointments found.</p>
              <Link href="/book-appointment">
                <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  Book a New Appointment
                </button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
          <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                if (activity.type === 'appointment') {
                  return (
                    <div key={index} className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Appointment {activity.data.status === 'completed' ? 'completed for' : 'booked by'} {activity.data.customer?.name || activity.data.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.data.appointment_services?.map(s => s.service?.name || s.service_name).join(', ')} • {getTimeSince(activity.timestamp)}
                        </p>
              </div>
            </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No recent activity to display.</p>
            </div>
          )}
          
          <div className="mt-5 text-center">
            <Link href="/reports">
              <button className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                View All Activity →
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 