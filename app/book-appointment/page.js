'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/auth';
import { getServices, getStaff, getStaffAvailability, createAppointment, getCustomers } from '../../lib/db';

export default function BookAppointment() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffAvailability, setStaffAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [appointmentTotal, setAppointmentTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch services and staff on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const servicesData = await getServices();
        setServices(servicesData);
        
        const staffData = await getStaff();
        setStaff(staffData);
        
        // Fetch customers list
        const customersData = await getCustomers();
        setCustomers(customersData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Prefill user email if logged in
    if (user) {
      setCustomerEmail(user.email);
    }
  }, [user]);

  // Fetch staff availability when date changes
  useEffect(() => {
    async function fetchAvailability() {
      try {
        if (selectedDate) {
          const availabilityData = await getStaffAvailability(selectedDate);
          setStaffAvailability(availabilityData);
        }
      } catch (err) {
        setError('Failed to load staff availability. Please try again.');
      }
    }
    
    fetchAvailability();
  }, [selectedDate]);

  // Update appointment total when services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      const total = selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0);
      setAppointmentTotal(total);
    } else {
      setAppointmentTotal(0);
    }
  }, [selectedServices]);

  // Select customer function
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || '');
    setShowCustomerSearch(false);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  // Handle radio button change for customer type
  const handleCustomerTypeChange = (e) => {
    const isExisting = e.target.value === 'existing';
    setIsExistingCustomer(isExisting);
    if (!isExisting) {
      // Reset customer data when switching to new customer
      setSelectedCustomer(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail(user?.email || '');
    }
  };

  // Handle service selection
  const toggleServiceSelection = (service) => {
    if (selectedServices.some(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Add service to pending appointments
  const addToPending = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    
    if (!selectedStaff) {
      setError('Please select a staff member');
      return;
    }
    
    if (!selectedTime) {
      setError('Please select an appointment time');
      return;
    }
    
    const newPendingAppointment = {
      services: selectedServices,
      staff: selectedStaff,
      date: selectedDate,
      time: selectedTime,
      total: appointmentTotal
    };
    
    setPendingAppointments([...pendingAppointments, newPendingAppointment]);
    
    // Reset selections for next service
    setSelectedServices([]);
    setSelectedTime('');
    setError(null);
  };

  // Remove a pending appointment
  const removePendingAppointment = (index) => {
    const newPendingAppointments = [...pendingAppointments];
    newPendingAppointments.splice(index, 1);
    setPendingAppointments(newPendingAppointments);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pendingAppointments.length === 0 && selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    
    if (pendingAppointments.length === 0 && (!selectedStaff || !selectedTime)) {
      setError('Please select a staff member and appointment time');
      return;
    }
    
    try {
      setLoading(true);
      
      // Customer data - either selected existing customer ID or new customer info
      const customerData = selectedCustomer ? 
        { customer_id: selectedCustomer.id } : 
        {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        };
      
      // Create appointment objects
      const appointments = [];
      
      // Add current selection if it has all required fields
      if (selectedServices.length > 0 && selectedStaff && selectedTime) {
        appointments.push({
          ...customerData,
          date: selectedDate,
          start_time: selectedTime,
          staff_id: selectedStaff.id,
          services: selectedServices.map(service => service.id),
          user_id: user?.id || null,
          status: 'pending'
        });
      }
      
      // Add all pending appointments
      pendingAppointments.forEach(pending => {
        appointments.push({
          ...customerData,
          date: pending.date,
          start_time: pending.time,
          staff_id: pending.staff.id,
          services: pending.services.map(service => service.id),
          user_id: user?.id || null,
          status: 'pending'
        });
      });
      
      // Create all appointments
      for (const appointment of appointments) {
        await createAppointment(appointment);
      }
      
      // Reset form and show success message
      setSelectedServices([]);
      setSelectedStaff(null);
      setSelectedTime('');
      setPendingAppointments([]);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time slots for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Generate available time slots for selected staff
  const getAvailableTimeSlots = () => {
    if (!selectedStaff) return [];
    
    const staffSlots = staffAvailability.filter(slot => 
      slot.staff_id === selectedStaff.id && 
      slot.date === selectedDate &&
      slot.is_available
    );
    
    const timeSlots = [];
    
    // Generate time slots from 9am to 8pm
    for (let hour = 9; hour <= 20; hour++) {
      const timeString = `${hour}:00`;
      const isAvailable = staffSlots.some(slot => {
        const slotStart = parseInt(slot.start_time.split(':')[0], 10);
        const slotEnd = parseInt(slot.end_time.split(':')[0], 10);
        return hour >= slotStart && hour < slotEnd;
      });
      
      if (isAvailable) {
        timeSlots.push(timeString);
      }
    }
    
    return timeSlots;
  };

  // Calculate total for all appointments
  const calculateTotal = () => {
    let total = appointmentTotal;
    
    pendingAppointments.forEach(appointment => {
      total += appointment.total;
    });
    
    return total;
  };

  // Filter services based on search query
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Book an Appointment</h1>
        
        {loading && !success ? (
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading services and availability...</p>
          </div>
        ) : success ? (
          <div className="max-w-xl mx-auto bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Appointment Booked Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you for booking with Hair & Care Unisex Salon. Your appointment(s) have been confirmed.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setSuccess(false)} 
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Book Another Appointment
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* BLOCK 1: Booking Form */}
            <div className="mb-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Book Your Appointment</h2>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Customer Information</h3>
                    
                    {/* Customer Type Selection */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="customerType"
                            value="new"
                            checked={!isExistingCustomer}
                            onChange={handleCustomerTypeChange}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">New Customer</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="customerType"
                            value="existing"
                            checked={isExistingCustomer}
                            onChange={handleCustomerTypeChange}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">Existing Customer</span>
                        </label>
                      </div>
                    </div>
                    
                    {isExistingCustomer ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-gray-700 dark:text-gray-300 mb-1">Search Customer</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={customerSearchQuery}
                              onChange={(e) => {
                                setCustomerSearchQuery(e.target.value);
                                setShowCustomerSearch(true);
                              }}
                              onClick={() => setShowCustomerSearch(true)}
                              className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Search by name, phone or email"
                            />
                            <svg
                              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          
                          {/* Customer search results dropdown */}
                          {showCustomerSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-y-auto">
                              {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                  <div
                                    key={customer.id}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                    onClick={() => selectCustomer(customer)}
                                  >
                                    <div className="font-medium text-gray-800 dark:text-white">{customer.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {customer.phone}{customer.email ? ` • ${customer.email}` : ''}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                  No customers found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {selectedCustomer && (
                          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="font-medium text-gray-800 dark:text-white">{selectedCustomer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedCustomer.phone}
                            </div>
                            {selectedCustomer.email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedCustomer.email}
                              </div>
                            )}
                            {selectedCustomer.membership_type && (
                              <div className="mt-1">
                                <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                                  {selectedCustomer.membership_type}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
                          <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input 
                            type="email" 
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Your email address"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input 
                            type="tel" 
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Date and Service Selection */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Select Services</h3>
                    
                    <div className="mb-3">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Search services..."
                        />
                        <svg 
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                      {filteredServices.length > 0 ? (
                        filteredServices.map(service => (
                          <div 
                            key={service.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedServices.some(s => s.id === service.id)
                                ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => toggleServiceSelection(service)}
                          >
                            <input 
                              type="checkbox"
                              checked={selectedServices.some(s => s.id === service.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-purple-600 rounded border-gray-300 dark:border-gray-700 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex-1">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">{service.name}</h4>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.duration_minutes} min
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  ₹{parseFloat(service.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500 dark:text-gray-400">No services found matching your search.</p>
                      )}
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Selected Services: {selectedServices.length}</p>
                          <p className="font-bold text-gray-800 dark:text-white">Total: ₹{appointmentTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedServices.length > 0 && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addToPending}
                          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                        >
                          + Add Another Service
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Pending Appointments */}
                {pendingAppointments.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Pending Appointments</h3>
                    <div className="space-y-4">
                      {pendingAppointments.map((appointment, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {appointment.staff.name} - {formatTime(appointment.time)}
                              </p>
                              <div className="mt-1 space-y-1">
                                {appointment.services.map(service => (
                                  <p key={service.id} className="text-sm text-gray-600 dark:text-gray-400">
                                    {service.name} - ₹{parseFloat(service.price).toLocaleString()}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                              <button
                                type="button"
                                onClick={() => removePendingAppointment(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                Total: ₹{appointment.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Total for all appointments</p>
                        <p className="font-bold text-gray-800 dark:text-white">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={loading || (pendingAppointments.length === 0 && selectedServices.length === 0)}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* BLOCK 2: Staff Availability */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Staff Availability for {new Date(selectedDate).toLocaleDateString()}
              </h2>
              
              {staff.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(person => {
                    const isSelected = selectedStaff && selectedStaff.id === person.id;
                    const availableSlots = staffAvailability.filter(slot => 
                      slot.staff_id === person.id && 
                      slot.date === selectedDate &&
                      slot.is_available
                    );
                    
                    return (
                      <div 
                        key={person.id}
                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                          isSelected 
                            ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => setSelectedStaff(person)}
                      >
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
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
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Times:</h4>
                          {availableSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {isSelected && getAvailableTimeSlots().map((time, index) => (
                                <button 
                                  key={index}
                                  type="button"
                                  className={`px-3 py-1 text-xs rounded-full border ${
                                    selectedTime === time
                                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTime(time);
                                  }}
                                >
                                  {formatTime(time)}
                                </button>
                              ))}
                              
                              {!isSelected && availableSlots.map((slot, index) => (
                                <div key={index} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No availability for selected date</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No staff available. Please check back later.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 