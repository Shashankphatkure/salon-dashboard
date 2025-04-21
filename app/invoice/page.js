'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAppointments, getCustomerById } from '../../lib/db';

export default function InvoicePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        console.log('🔍 Fetching appointments...');
        
        // Get all appointments instead of just completed ones
        const appointmentsData = await getAppointments();
        
        console.log('✅ Appointments fetched:', appointmentsData.length);
        setAppointments(appointmentsData);
        
        // Transform appointments into invoices
        const processedInvoices = [];
        
        for (const appointment of appointmentsData) {
          let customerInfo = appointment.customers;
          
          if (!customerInfo && appointment.customer_id) {
            // If customer info is not already joined, fetch it
            try {
              customerInfo = await getCustomerById(appointment.customer_id);
            } catch (err) {
              console.error(`Error fetching customer ${appointment.customer_id}:`, err);
              customerInfo = { name: 'Unknown Customer' };
            }
          }
          
          processedInvoices.push({
            id: `INV-${appointment.id.substring(0, 6)}`,
            appointment_id: appointment.id,
            customer: customerInfo?.name || 'Unknown Customer',
            customer_id: appointment.customer_id,
            date: appointment.date,
            amount: appointment.total_price || 0,
            status: appointment.status === 'completed' ? 'Paid' : 'Pending',
            appointment: appointment,
            customerInfo: customerInfo
          });
        }
        
        setInvoices(processedInvoices);
        setFilteredInvoices(processedInvoices);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
        setLoading(false);
      }
    }
    
    fetchAppointments();
  }, []);
  
  // Apply filter when statusFilter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => 
        invoice.status.toLowerCase() === statusFilter.toLowerCase()
      ));
    }
  }, [statusFilter, invoices]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${suffix}`;
  };
  
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };
  
  const handlePrintInvoice = (invoice) => {
    // Open a new window for the invoice
    const invoiceWindow = window.open('', '_blank');
    
    if (!invoiceWindow) {
      alert('Please allow popups to print the invoice');
      return;
    }
    
    // Get appointment and customer info
    const appointment = invoice.appointment;
    const customerInfo = invoice.customerInfo;
    
    // Calculate service prices
    const services = appointment.services || [];
    let totalAmount = 0;
    
    services.forEach(service => {
      if (service.price) {
        totalAmount += parseFloat(service.price);
      }
    });
    
    // If no services or no total, use the appointment total
    if (totalAmount === 0 && appointment.total_price) {
      totalAmount = parseFloat(appointment.total_price);
    }
    
    // Generate invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .invoice-title {
            font-size: 28px;
            color: #512da8;
          }
          .invoice-details {
            margin-bottom: 30px;
          }
          .customer-details, .salon-details {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          th {
            background-color: #f8f8f8;
          }
          .total-row {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              box-shadow: none;
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div>
              <div class="invoice-title">Hair & Care Unisex Salon</div>
              <div>Shop No 03, Ground floor, Govind Chintamani CHS</div>
              <div>Plot No.57/4, near Taluka Police Station, Nityanand Nagar</div>
              <div>HOC Colony, Panvel, Navi Mumbai, Maharashtra 410206</div>
              <div>Phone: +91 93722 17698</div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div>Date: ${formatDate(appointment.date)}</div>
              <div>Invoice #: ${invoice.id}</div>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="customer-details">
              <h3>BILL TO:</h3>
              <div>${customerInfo?.name || 'Guest Customer'}</div>
              <div>${customerInfo?.phone || ''}</div>
              <div>${customerInfo?.email || ''}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Staff</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(service => `
                <tr>
                  <td>${service.service?.name || 'Service'}</td>
                  <td>${appointment.staff?.name || 'Staff'}</td>
                  <td>${formatDate(appointment.date)}</td>
                  <td>${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}</td>
                  <td>₹${parseFloat(service.price || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
              ${services.length === 0 ? `
                <tr>
                  <td>Salon Services</td>
                  <td>${appointment.staff?.name || 'Staff'}</td>
                  <td>${formatDate(appointment.date)}</td>
                  <td>${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}</td>
                  <td>₹${parseFloat(appointment.total_price || 0).toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Total:</td>
                <td>₹${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for your business! We look forward to seeing you again.</p>
            ${customerInfo?.membership_type ? `<p>Membership Plan: ${customerInfo.membership_type}</p>` : ''}
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #512da8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Invoice
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window and print
    invoiceWindow.document.open();
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Invoices</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-purple-500"
                >
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <a 
                href="/book-appointment"
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                New Booking
              </a>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <p className="ml-4 text-gray-600 dark:text-gray-300">Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No invoices found.</p>
              <a 
                href="/book-appointment"
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Book an Appointment
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{invoice.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(invoice.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">₹{invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          View
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                          onClick={() => handlePrintInvoice(invoice)}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Invoice Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Invoice #{selectedInvoice.id}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedInvoice.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedInvoice.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedInvoice.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount:</p>
                    <p className="font-medium text-gray-800 dark:text-white">₹{selectedInvoice.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Services</h3>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedInvoice.appointment.services && selectedInvoice.appointment.services.length > 0 ? (
                      selectedInvoice.appointment.services.map((service, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{service.service?.name || 'Service'}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">₹{parseFloat(service.price || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">Salon Services</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">₹{parseFloat(selectedInvoice.amount).toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white text-right">Total:</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white">₹{selectedInvoice.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  onClick={() => {
                    handlePrintInvoice(selectedInvoice);
                  }}
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 