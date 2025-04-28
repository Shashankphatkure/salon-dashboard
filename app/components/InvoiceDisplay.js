'use client';

import { useState } from 'react';

export default function InvoiceDisplay({ appointment }) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${suffix}`;
  };

  // Calculate total service amount
  const calculateTotalAmount = () => {
    if (!appointment || !appointment.services) return 0;
    
    return appointment.services.reduce((total, serviceItem) => {
      return total + (serviceItem.service?.price || 0);
    }, 0);
  };

  const handlePrintInvoice = () => {
    setIsPrinting(true);
    const invoiceContent = document.getElementById('invoice-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = invoiceContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    // We need to re-render the component after printing
    window.location.reload();
  };

  // Generate invoice ID based on appointment ID
  const invoiceId = `INV-${appointment.id.substring(0, 6)}`;
  const totalAmount = calculateTotalAmount();
  const services = appointment.services || [];
  const customerInfo = appointment.customers || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invoice #{invoiceId}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Print
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
        
        <div id="invoice-content" className="p-6">
          <div className="invoice-container">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Hair & Care Unisex Salon</h2>
                <p className="text-gray-600 dark:text-gray-300">Shop No 03, Ground floor, Govind Chintamani CHS</p>
                <p className="text-gray-600 dark:text-gray-300">Plot No.57/4, near Taluka Police Station, Nityanand Nagar</p>
                <p className="text-gray-600 dark:text-gray-300">HOC Colony, Panvel, Navi Mumbai, Maharashtra 410206</p>
                <p className="text-gray-600 dark:text-gray-300">Phone: +91 93722 17698</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">INVOICE</h2>
                <p className="text-gray-600 dark:text-gray-300">Date: {formatDate(appointment.date)}</p>
                <p className="text-gray-600 dark:text-gray-300">Invoice #: {invoiceId}</p>
                <p className="text-gray-600 dark:text-gray-300">Status: {appointment.status === 'completed' ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">BILL TO:</h3>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">{customerInfo?.name || 'Guest Customer'}</p>
              <p className="text-gray-600 dark:text-gray-400">{customerInfo?.phone || ''}</p>
              <p className="text-gray-600 dark:text-gray-400">{customerInfo?.email || ''}</p>
            </div>
            
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {services.map((serviceItem, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {serviceItem.service?.name || 'Service'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {appointment.staff?.name || 'Staff'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        ₹{serviceItem.service?.price || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                      Subtotal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                      ₹{totalAmount}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                      Discount
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                      ₹0.00
                    </td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-gray-900 dark:text-white">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 dark:text-white text-right">
                      ₹{totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Payment Method: Cash</p>
              <p className="text-gray-600 dark:text-gray-400">Payment Date: {formatDate(appointment.completed_at || appointment.date)}</p>
            </div>
            
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>Thank you for your business!</p>
              <p>For any inquiries, please contact us at: +91 93722 17698</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 