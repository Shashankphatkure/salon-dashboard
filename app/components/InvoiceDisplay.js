'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function InvoiceDisplay({ appointment, onClose }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);
  
  // Generate invoice ID based on appointment ID
  const invoiceId = `INV-${appointment.id.substring(0, 6)}`;
  const services = appointment.services || [];
  const customerInfo = appointment.customers || {};

  // Calculate total service amount
  const calculateTotalAmount = () => {
    if (!appointment || !appointment.services || appointment.services.length === 0) {
      return parseFloat(appointment.total_price || 0);
    }
    
    return appointment.services.reduce((total, serviceItem) => {
      // Check all possible locations for the price
      const price = serviceItem.price || 
                   (serviceItem.service && serviceItem.service.price) || 
                   0;
      return total + parseFloat(price);
    }, 0);
  };
  
  const totalAmount = calculateTotalAmount();

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

  // Handle print function using react-to-print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeprint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
    documentTitle: `Invoice-${invoiceId}`
  });

  // Handle back/close button
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      // Fallback if onClose is not provided
      window.history.back();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invoice #{invoiceId}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              disabled={isPrinting}
            >
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          <div ref={printRef} className="invoice-container">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-start">
                <div className="mr-4 w-20 h-20 relative">
                  <img 
                    src="/logo.png" 
                    alt="Salon Logo" 
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-600 mb-1">Hair & Care Unisex Salon</h2>
                  <p className="text-gray-600">Shop No 03, Ground floor, Govind Chintamani CHS</p>
                  <p className="text-gray-600">Plot No.57/4, near Taluka Police Station, Nityanand Nagar</p>
                  <p className="text-gray-600">HOC Colony, Panvel, Navi Mumbai, Maharashtra 410206</p>
                  <p className="text-gray-600">Phone: +91 93722 17698</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">INVOICE</h2>
                <p className="text-gray-600">Date: {formatDate(appointment.date)}</p>
                <p className="text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
                <p className="text-gray-600">Created: {formatDate(new Date())} </p>
                <p className="text-gray-600">Invoice #: {invoiceId}</p>
                <p className="text-gray-600">Status: {appointment.status === 'completed' ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">BILL TO:</h3>
              <p className="text-gray-700 font-semibold">{customerInfo?.name || 'Guest Customer'}</p>
              <p className="text-gray-600">{customerInfo?.phone || ''}</p>
              <p className="text-gray-600">{customerInfo?.email || ''}</p>
            </div>
            
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services && services.length > 0 ? (
                    services.map((serviceItem, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {serviceItem.service?.name || 'Service'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.staff?.name || 'Staff'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(appointment.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{parseFloat(serviceItem.price || (serviceItem.service && serviceItem.service.price) || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Salon Services
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.staff?.name || 'Staff'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ₹{parseFloat(appointment.total_price || 0).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      Subtotal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ₹{totalAmount.toLocaleString()}
                    </td>
                  </tr>
                  
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                      ₹{totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mb-8 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Information</h3>
              <p className="text-gray-600">Payment Method: Cash</p>
              <p className="text-gray-600">Payment Date: {formatDate(appointment.completed_at || appointment.date)}</p>
              {customerInfo?.membership_type && (
                <p className="text-gray-600">Membership Plan: {customerInfo.membership_type}</p>
              )}
            </div>
            
            <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
              <p>Thank you for your business!</p>
              <p>For any inquiries, please contact us at: +91 93722 17698</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 