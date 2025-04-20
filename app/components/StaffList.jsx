'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

const StaffList = () => {
  const supabase = createClientComponentClient();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    title: '',
    description: '',
    email: '',
    phone: '',
    specialties: ''
  });
  const [error, setError] = useState(null);

  // Fetch staff from Supabase
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setStaff(data || []);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setError('Failed to load staff data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaff();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedStaff) {
      setSelectedStaff({
        ...selectedStaff,
        [name]: value
      });
    } else {
      setNewStaff({
        ...newStaff,
        [name]: value
      });
    }
  };

  // Open modal for adding a new staff member
  const openAddModal = () => {
    setSelectedStaff(null);
    setNewStaff({
      name: '',
      title: '',
      description: '',
      email: '',
      phone: '',
      specialties: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing staff member
  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedStaff) {
        // Parse specialties into an array
        const specialtiesArray = selectedStaff.specialties && typeof selectedStaff.specialties === 'string'
          ? selectedStaff.specialties.split(',').map(s => s.trim())
          : selectedStaff.specialties || [];
        
        // Update existing staff member
        const { error } = await supabase
          .from('staff')
          .update({
            name: selectedStaff.name,
            title: selectedStaff.title,
            description: selectedStaff.description,
            email: selectedStaff.email,
            phone: selectedStaff.phone,
            specialties: specialtiesArray,
            updated_at: new Date()
          })
          .eq('id', selectedStaff.id);
          
        if (error) throw error;
        
      } else {
        // Parse specialties into an array
        const specialtiesArray = newStaff.specialties
          ? newStaff.specialties.split(',').map(s => s.trim())
          : [];
        
        // Add new staff member
        const { error } = await supabase
          .from('staff')
          .insert({
            name: newStaff.name,
            title: newStaff.title,
            description: newStaff.description,
            email: newStaff.email,
            phone: newStaff.phone,
            specialties: specialtiesArray
          });
          
        if (error) throw error;
      }
      
      // Refresh staff list
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setStaff(data || []);
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Error saving staff:', error);
      setError('Error saving staff member. Please try again.');
    }
  };

  // Handle staff deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Remove from state
        setStaff(staff.filter(s => s.id !== id));
        
      } catch (error) {
        console.error('Error deleting staff:', error);
        setError('Error deleting staff member. Please try again.');
      }
    }
  };

  // Format availability display
  const getAvailabilityDays = (availabilityData) => {
    if (!availabilityData || !Array.isArray(availabilityData) || availabilityData.length === 0) {
      return 'Schedule not set';
    }
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const availableDays = availabilityData.map(a => a.day.toLowerCase());
    
    return days
      .filter(day => availableDays.includes(day))
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Add Staff Button */}
      <div className="flex justify-end">
        <button 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2"
          onClick={openAddModal}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Staff Member
        </button>
      </div>
      
      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.length > 0 ? (
          staff.map((staffMember) => (
            <div key={staffMember.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{staffMember.name}</h3>
                <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">{staffMember.title}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {staffMember.description || 'No description provided.'}
                </p>
                
                {staffMember.specialties && staffMember.specialties.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SPECIALTIES</h4>
                    <div className="flex flex-wrap gap-2">
                      {staffMember.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">ACTIONS</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(staffMember)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-sm rounded"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/staff/${staffMember.id}`}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-300 text-sm rounded"
                    >
                      Schedule
                    </Link>
                    <button
                      onClick={() => handleDelete(staffMember.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 text-sm rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
            No staff members found. Add your first staff member to get started.
          </div>
        )}
      </div>
      
      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={selectedStaff ? selectedStaff.name : newStaff.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title/Position *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={selectedStaff ? selectedStaff.title : newStaff.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Hair Stylist"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={selectedStaff ? selectedStaff.email : newStaff.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={selectedStaff ? selectedStaff.phone : newStaff.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specialties (comma separated)
                  </label>
                  <input
                    type="text"
                    name="specialties"
                    value={selectedStaff 
                      ? (Array.isArray(selectedStaff.specialties) 
                          ? selectedStaff.specialties.join(', ') 
                          : selectedStaff.specialties || '')
                      : newStaff.specialties}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Hair Coloring, Styling, Cuts"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={selectedStaff ? selectedStaff.description : newStaff.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter a description of this staff member"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                >
                  {selectedStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList; 