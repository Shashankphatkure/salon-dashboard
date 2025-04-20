'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/auth';
import { getStaff, getStaffAvailability, updateStaffAvailability } from '../../lib/db';

export default function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [staffAvailability, setStaffAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [blockedTimers, setBlockedTimers] = useState({});

  // Generate time slots from 9am to 8pm
  useEffect(() => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push({
        id: `slot-${hour}`,
        time: `${hour}:00`,
        displayTime: formatTime(`${hour}:00`),
        available: true, 
      });
    }
    setTimeSlots(slots);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/staff');
      return;
    }

    async function fetchStaffData() {
      try {
        setLoading(true);
        
        // Fetch staff members
        const staffData = await getStaff();
        setStaff(staffData);
        
        if (staffData.length > 0 && !selectedStaffId) {
          setSelectedStaffId(staffData[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load staff data. Please try again.');
        setLoading(false);
      }
    }
    
    if (user) {
      fetchStaffData();
    }
  }, [user, authLoading, router]);

  // Fetch staff availability when date or selected staff changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedStaffId) return;
      
      try {
        const availabilityData = await getStaffAvailability(selectedDate);
        
        // Filter availability for selected staff
        const staffAvail = availabilityData.filter(a => a.staff_id === selectedStaffId);
        
        // Create a map of time slots to availability
        const availabilityMap = {};
        
        staffAvail.forEach(a => {
          // Extract the hour from start_time (format: "HH:MM:SS")
          const hour = a.start_time.split(':')[0];
          availabilityMap[`slot-${hour}`] = a.is_available;
        });
        
        // Update time slots with availability
        setTimeSlots(prevSlots => 
          prevSlots.map(slot => ({
            ...slot,
            available: availabilityMap[slot.id] !== undefined ? availabilityMap[slot.id] : true
          }))
        );
        
        setStaffAvailability(availabilityMap);
      } catch (err) {
        console.error('Error fetching staff availability:', err);
        setError('Failed to load staff availability. Please try again.');
      }
    }
    
    fetchAvailability();
  }, [selectedDate, selectedStaffId]);

  // Format time for display
  function formatTime(timeString) {
    const [hour] = timeString.split(':');
    const hourNum = parseInt(hour);
    return hourNum > 12 
      ? `${hourNum - 12}:00 PM` 
      : hourNum === 12 
        ? '12:00 PM' 
        : `${hour}:00 AM`;
  }

  // Toggle time slot availability with timer for blocked slots
  const toggleTimeSlot = (slotId) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.id === slotId) {
          // If slot is currently available, we can block it
          if (slot.available) {
            return { ...slot, available: false };
          } 
          // If slot is blocked but has no active timer, check if we can unblock it
          else if (!blockedTimers[slotId]) {
            return { ...slot, available: true };
          }
          // If slot has an active timer, it cannot be unblocked
          return slot;
        }
        return slot;
      })
    );
  };

  // Start a timer when a slot is blocked
  const startBlockTimer = (slotId) => {
    // Set a 5-minute timer (300000 ms) for the blocked slot
    const timerId = setTimeout(() => {
      // Remove the timer after it expires
      setBlockedTimers(prev => {
        const newTimers = {...prev};
        delete newTimers[slotId];
        return newTimers;
      });
    }, 300000); // 5 minutes
    
    // Store the timer ID
    setBlockedTimers(prev => ({
      ...prev,
      [slotId]: timerId
    }));
  };

  // Clear timers when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all timers
      Object.values(blockedTimers).forEach(timerId => {
        clearTimeout(timerId);
      });
    };
  }, [blockedTimers]);

  // Save staff availability
  const saveAvailability = async () => {
    if (!selectedStaffId || !selectedDate) {
      setError('Please select a staff member and date');
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      // Format time slots for API
      const formattedSlots = timeSlots.map(slot => ({
        start: slot.time,
        end: slot.time.replace(':00', ':59'),
        available: slot.available
      }));
      
      await updateStaffAvailability(selectedStaffId, selectedDate, formattedSlots);
      
      setSuccess('Staff availability updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating staff availability:', err);
      setError('Failed to update staff availability. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Staff Management</h1>
          <button 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            onClick={() => router.push('/staff/new')}
          >
            Add New Staff
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 mb-8 rounded-md">
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}
        
        {/* Staff List */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Staff Cards */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Staff Members</h2>
                
                {staff.length > 0 ? (
                  <div className="space-y-3">
                    {staff.map((person) => (
                      <div 
                        key={person.id} 
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStaffId === person.id 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700' 
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                        }`}
                        onClick={() => setSelectedStaffId(person.id)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                            <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                              {person.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-white">{person.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{person.role}</p>
                          </div>
                          <div className="ml-auto">
                            {person.is_available ? (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                                Not Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No staff members found.</p>
                    <button 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                      onClick={() => router.push('/staff/new')}
                    >
                      Add Staff Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Staff Availability Management */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Staff Availability
                </h2>
                
                {selectedStaffId ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Date</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                        Available Time Slots for {staff.find(s => s.id === selectedStaffId)?.name || 'Selected Staff'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Toggle the time slots to mark when the staff member is available.
                      </p>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((slot) => {
                          const isLocked = !slot.available && blockedTimers[slot.id];
                          return (
                            <button
                              key={slot.id}
                              className={`p-3 rounded-md text-center transition-colors ${
                                slot.available
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                              } ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                              onClick={() => {
                                // If slot is available, we can block it and start a timer
                                if (slot.available) {
                                  toggleTimeSlot(slot.id);
                                  startBlockTimer(slot.id);
                                } 
                                // If slot is blocked but not locked, we can unblock it
                                else if (!isLocked) {
                                  toggleTimeSlot(slot.id);
                                }
                              }}
                            >
                              <span className="block text-sm font-medium">{slot.displayTime}</span>
                              <span className="block text-xs mt-1">
                                {slot.available 
                                  ? 'Available'
                                  : isLocked 
                                    ? 'Locked (5 min)'
                                    : 'Blocked'}
                              </span>
                              {isLocked && (
                                <span className="block mt-1">
                                  <svg className="animate-spin h-4 w-4 mx-auto text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={saveAvailability}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save Availability'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a staff member to manage their availability.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Staff Details */}
            {selectedStaffId && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mt-6">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    Staff Details
                  </h2>
                  
                  {staff.find(s => s.id === selectedStaffId) && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Contact Information</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <span className="text-gray-800 dark:text-white font-medium">{staff.find(s => s.id === selectedStaffId)?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="text-gray-800 dark:text-white font-medium">{staff.find(s => s.id === selectedStaffId)?.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Services</h3>
                          <div className="space-y-2">
                            {staff.find(s => s.id === selectedStaffId)?.staff_services?.length > 0 ? (
                              staff.find(s => s.id === selectedStaffId)?.staff_services.map((service, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                  <span className="text-gray-800 dark:text-white">{service.services?.name || 'Unknown Service'}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No services assigned.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button 
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => router.push(`/staff/${selectedStaffId}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                          onClick={() => router.push(`/staff/${selectedStaffId}/edit`)}
                        >
                          Edit Staff
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 