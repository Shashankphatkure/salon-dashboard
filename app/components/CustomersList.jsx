'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const CustomersList = () => {
  const supabase = createClientComponentClient();
  // Customer state
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    birthdate: '',
    gender: '',
    address: '',
    membershipType: 'None'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order(sortBy, { ascending: sortDirection === 'asc' });
        
      if (error) throw error;
      
      setCustomers(data.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        birthdate: customer.birthdate,
        gender: customer.gender,
        address: customer.address,
        joinDate: customer.join_date,
        lastVisit: customer.last_visit,
        membershipType: customer.membership_type,
        totalSpent: customer.total_spent,
        visits: customer.visits
      })));
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Error loading customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers on component mount and sort change
  useEffect(() => {
    fetchCustomers();
  }, [sortBy, sortDirection]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedCustomer) {
      setSelectedCustomer({
        ...selectedCustomer,
        [name]: value
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: value
      });
    }
  };

  // Open modal for adding a new customer
  const openAddModal = () => {
    setSelectedCustomer(null);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      birthdate: '',
      gender: '',
      address: '',
      membershipType: 'None'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing customer
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Open modal for viewing customer details
  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCustomer) {
        // Update existing customer in Supabase
        const { error } = await supabase
          .from('customers')
          .update({
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email,
            birthdate: selectedCustomer.birthdate,
            gender: selectedCustomer.gender,
            address: selectedCustomer.address,
            updated_at: new Date()
          })
          .eq('id', selectedCustomer.id);
          
        if (error) throw error;
        setIsModalOpen(false);
        
      } else {
        // Add new customer to Supabase
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            birthdate: newCustomer.birthdate,
            gender: newCustomer.gender,
            address: newCustomer.address,
            membership_type: newCustomer.membershipType || 'None',
            join_date: today,
            last_visit: today,
            total_spent: 0,
            visits: 0
          })
          .select();
          
        if (error) throw error;
        
        setIsModalOpen(false);
        
        // Ask if user wants to assign a membership if none is selected or default
        if ((newCustomer.membershipType === 'None' || !newCustomer.membershipType) && data && data[0]) {
          const goToMembership = window.confirm('Customer created successfully! Would you like to assign a membership plan now?');
          if (goToMembership) {
            window.location.href = `/membership?customer=${data[0].id}`;
            return;
          }
        }
      }
      
      // Refresh customer list
      fetchCustomers();
      
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  // Handle customer deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Refresh customer list
        fetchCustomers();
        
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer. Please try again.');
      }
    }
  };

  // Sort customers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.membershipType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Render sort indicator
  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Customer */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            placeholder="Search customers by name, phone, email or membership..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <button 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 min-w-[150px]"
          onClick={openAddModal}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('membershipType')}
              >
                <div className="flex items-center">
                  Membership {renderSortIcon('membershipType')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastVisit')}
              >
                <div className="flex items-center">
                  Last Visit {renderSortIcon('lastVisit')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalSpent')}
              >
                <div className="flex items-center">
                  Total Spent {renderSortIcon('totalSpent')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-medium">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Since {new Date(customer.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.membershipType === 'Gold' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' :
                      customer.membershipType === 'Silver Plus' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300' :
                      customer.membershipType === 'Silver' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                      customer.membershipType === 'Credit' ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {customer.membershipType || 'None'}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {customer.visits} visits
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(customer.lastVisit).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ₹{customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                      onClick={() => openViewModal(customer)}
                    >
                      View
                    </button>
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      onClick={() => openEditModal(customer)}
                    >
                      Edit
                    </button>
                    <Link 
                      href={`/membership?customer=${customer.id}`}
                      className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 mr-3"
                    >
                      Membership
                    </Link>
                    <Link 
                      href={`/credit?customer=${customer.id}`}
                      className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 mr-3"
                    >
                      Credits
                    </Link>
                    <button 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No customers found. Try a different search term or add a new customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
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
                    value={selectedCustomer ? selectedCustomer.name : newCustomer.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={selectedCustomer ? selectedCustomer.phone : newCustomer.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone number"
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
                    value={selectedCustomer ? selectedCustomer.email : newCustomer.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={selectedCustomer ? selectedCustomer.birthdate : newCustomer.birthdate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={selectedCustomer ? selectedCustomer.gender : newCustomer.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                {!selectedCustomer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Membership
                    </label>
                    <select
                      name="membershipType"
                      value={newCustomer.membershipType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="None">No Membership</option>
                      <option value="Silver">Silver</option>
                      <option value="Silver Plus">Silver Plus</option>
                      <option value="Gold">Gold</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={selectedCustomer ? selectedCustomer.address : newCustomer.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter address"
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
                  {selectedCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Customer Details
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setIsViewModalOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="sm:w-1/3">
                <div className="h-32 w-32 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-5xl font-medium mb-4">
                  {selectedCustomer.name.charAt(0)}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white text-center mb-2">
                    {selectedCustomer.name}
                  </h4>
                  
                  <div className="text-center mb-4">
                    <span className={`px-3 py-1 text-sm rounded-full inline-block ${
                      selectedCustomer.membershipType === 'Gold' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' :
                      selectedCustomer.membershipType === 'Silver Plus' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300' :
                      selectedCustomer.membershipType === 'Silver' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                      selectedCustomer.membershipType === 'Credit' ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {selectedCustomer.membershipType || 'No Membership'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Customer Since:</span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Visits:</span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        {selectedCustomer.visits}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Spent:</span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        ₹{selectedCustomer.totalSpent.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="sm:w-2/3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{selectedCustomer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {selectedCustomer.birthdate ? new Date(selectedCustomer.birthdate).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{selectedCustomer.gender || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">{selectedCustomer.address || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Visit</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {new Date(selectedCustomer.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(selectedCustomer);
                    }}
                  >
                    Edit Details
                  </button>
                  <Link
                    href={`/membership?customer=${selectedCustomer.id}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Manage Membership
                  </Link>
                  <Link
                    href={`/credit?customer=${selectedCustomer.id}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    View Credits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList; 