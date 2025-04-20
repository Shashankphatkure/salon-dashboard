'use client';

import { useState } from 'react';
import Link from 'next/link';

const CustomersList = () => {
  // Mock customer data for demonstration
  const [customers, setCustomers] = useState([
    { 
      id: 1, 
      name: 'Amit Kumar', 
      phone: '9876543210', 
      email: 'amit.kumar@example.com', 
      birthdate: '1985-05-15',
      gender: 'Male',
      address: 'C-45, Sector 15, Noida, UP',
      joinDate: '2023-10-15',
      lastVisit: '2024-07-02',
      membershipType: 'Gold',
      totalSpent: 45000,
      visits: 12
    },
    { 
      id: 2, 
      name: 'Priya Sharma', 
      phone: '9876543211', 
      email: 'priya.sharma@example.com', 
      birthdate: '1990-08-22',
      gender: 'Female',
      address: 'A-12, Malviya Nagar, New Delhi',
      joinDate: '2023-11-05',
      lastVisit: '2024-06-28',
      membershipType: 'Silver Plus',
      totalSpent: 28000,
      visits: 8
    },
    { 
      id: 3, 
      name: 'Rajat Verma', 
      phone: '9876543212', 
      email: 'rajat.verma@example.com', 
      birthdate: '1982-03-10',
      gender: 'Male',
      address: 'B-78, DLF Phase 2, Gurgaon, Haryana',
      joinDate: '2024-01-20',
      lastVisit: '2024-06-15',
      membershipType: 'Silver',
      totalSpent: 15000,
      visits: 5
    },
    { 
      id: 4, 
      name: 'Neha Singh', 
      phone: '9876543213', 
      email: 'neha.singh@example.com', 
      birthdate: '1988-12-03',
      gender: 'Female',
      address: 'D-22, Vasant Kunj, New Delhi',
      joinDate: '2024-02-10',
      lastVisit: '2024-07-05',
      membershipType: 'Credit',
      totalSpent: 32000,
      visits: 7
    },
    { 
      id: 5, 
      name: 'Vikram Malhotra', 
      phone: '9876543214', 
      email: 'vikram.malhotra@example.com', 
      birthdate: '1975-07-18',
      gender: 'Male',
      address: 'E-56, Greater Kailash, New Delhi',
      joinDate: '2023-09-12',
      lastVisit: '2024-05-20',
      membershipType: 'None',
      totalSpent: 8000,
      visits: 2
    }
  ]);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedCustomer) {
      // Update existing customer
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id ? selectedCustomer : customer
      ));
      setIsModalOpen(false);
    } else {
      // Add new customer
      const newId = Math.max(...customers.map(c => c.id), 0) + 1;
      const today = new Date().toISOString().split('T')[0];
      
      const newCustomerWithId = {
        ...newCustomer,
        id: newId,
        joinDate: today,
        lastVisit: today,
        membershipType: newCustomer.membershipType || 'None',
        totalSpent: 0,
        visits: 0
      };
      
      setCustomers([...customers, newCustomerWithId]);
      setIsModalOpen(false);
      
      // Ask if user wants to assign a membership if none is selected
      if (newCustomer.membershipType === 'None') {
        const goToMembership = window.confirm('Customer created successfully! Would you like to assign a membership plan now?');
        if (goToMembership) {
          window.location.href = `/membership?customer=${newId}`;
        }
      }
    }
  };

  // Handle customer deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
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

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.membershipType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (typeof valueA === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });

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
                    <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</div>
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
                      href={`/membership/${customer.id}`}
                      className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 mr-3"
                    >
                      Membership
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Membership
                  </label>
                  <select
                    name="membershipType"
                    value={selectedCustomer ? selectedCustomer.membershipType : newCustomer.membershipType}
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
                    href={`/membership/${selectedCustomer.id}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Manage Membership
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