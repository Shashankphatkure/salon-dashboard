'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';

export default function StaffAvailability() {
  const supabase = createClientComponentClient();
  const [staff, setStaff] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(true); // true = available, false = unavailable
  
  // Time slots for the day, spanning from 9 AM to 8 PM with 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) { // Don't add :30 for the last hour
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  // Week days starting from today
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  );

  useEffect(() => {
    const fetchStaffAndAvailability = async () => {
      try {
        setIsLoading(true);
        
        // Fetch staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .order('name');
          
        if (staffError) throw staffError;
        
        // Fetch availability for all staff for the current week
        const startDate = format(weekDays[0], 'yyyy-MM-dd');
        const endDate = format(weekDays[6], 'yyyy-MM-dd');
        
        const { data: availData, error: availError } = await supabase
          .from('staff_availability')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (availError) throw availError;
        
        // Process availability data
        const availabilityMap = {};
        
        availData.forEach(item => {
          if (!availabilityMap[item.staff_id]) {
            availabilityMap[item.staff_id] = {};
          }
          
          if (!availabilityMap[item.staff_id][item.date]) {
            availabilityMap[item.staff_id][item.date] = [];
          }
          
          availabilityMap[item.staff_id][item.date].push({
            start: item.start_time,
            end: item.end_time,
            isAvailable: item.is_available
          });
        });
        
        setStaff(staffData || []);
        setAvailability(availabilityMap);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaffAndAvailability();
  }, [selectedDate]);

  // Check if a staff member is available for a specific date and time slot
  const isStaffAvailable = (staffId, date, timeSlot) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const staffAvail = availability[staffId]?.[dateString] || [];
    
    return staffAvail.some(slot => {
      // Parse hours and minutes for more precise comparison
      const [slotHour, slotMinute] = timeSlot.split(':').map(num => parseInt(num, 10));
      const [startHour, startMinute] = slot.start.split(':').map(num => parseInt(num, 10));
      const [endHour, endMinute] = slot.end.split(':').map(num => parseInt(num, 10));
      
      // Convert to minutes for easier comparison
      const slotTotalMinutes = slotHour * 60 + slotMinute;
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      return slot.isAvailable && 
        slotTotalMinutes >= startTotalMinutes && 
        slotTotalMinutes < endTotalMinutes;
    });
  };

  // Determine the class for a time slot
  const getTimeSlotClass = (staffId, date, timeSlot) => {
    // Basic classes for all cells
    let classes = "h-6 w-full border border-gray-200 dark:border-gray-700 cursor-pointer ";
    
    if (isStaffAvailable(staffId, date, timeSlot)) {
      classes += "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 ";
    } else {
      classes += "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 ";
    }
    
    // Add selected class if in bulk mode and this day is selected
    if (bulkMode && selectedDays.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) {
      classes += "ring-2 ring-purple-500 ";
    }
    
    return classes;
  };

  // Function to handle adding/updating availability
  const handleToggleAvailability = async (staffId, date, timeSlot) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const isCurrentlyAvailable = isStaffAvailable(staffId, date, timeSlot);
      
      // Toggle availability
      const newAvailabilityStatus = !isCurrentlyAvailable;
      
      // Calculate end time (30 minutes after start)
      const [hour, minute] = timeSlot.split(':');
      let endTimeHour = parseInt(hour);
      let endTimeMinute = parseInt(minute) + 30;
      
      if (endTimeMinute >= 60) {
        endTimeHour += 1;
        endTimeMinute = 0;
      }
      
      const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
      
      // Check if we need to update or insert
      const { data: existingSlot } = await supabase
        .from('staff_availability')
        .select('id')
        .eq('staff_id', staffId)
        .eq('date', dateString)
        .eq('start_time', timeSlot);
      
      if (existingSlot && existingSlot.length > 0) {
        // Update existing record
        await supabase
          .from('staff_availability')
          .update({ is_available: newAvailabilityStatus })
          .eq('id', existingSlot[0].id);
      } else {
        // Insert new record
        await supabase
          .from('staff_availability')
          .insert({
            staff_id: staffId,
            date: dateString,
            start_time: timeSlot,
            end_time: endTimeSlot,
            is_available: newAvailabilityStatus
          });
      }
      
      // Update local state (quick update without refetching)
      const newAvailability = { ...availability };
      
      if (!newAvailability[staffId]) {
        newAvailability[staffId] = {};
      }
      
      if (!newAvailability[staffId][dateString]) {
        newAvailability[staffId][dateString] = [];
      }
      
      // Filter out the existing slot if it exists
      newAvailability[staffId][dateString] = newAvailability[staffId][dateString]
        .filter(slot => slot.start !== timeSlot);
        
      // Add the new slot
      newAvailability[staffId][dateString].push({
        start: timeSlot,
        end: endTimeSlot,
        isAvailable: newAvailabilityStatus
      });
      
      setAvailability(newAvailability);
      
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  // Toggle selected day for bulk operations
  const toggleDaySelection = (day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const isSelected = selectedDays.some(d => format(d, 'yyyy-MM-dd') === dayString);
    
    if (isSelected) {
      setSelectedDays(selectedDays.filter(d => format(d, 'yyyy-MM-dd') !== dayString));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Apply bulk operations to selected days and time slots
  const applyBulkOperation = async () => {
    if (!selectedStaff || selectedDays.length === 0) {
      alert('Please select a staff member and at least one day');
      return;
    }

    try {
      // Start with batch insert/update
      const operations = [];
      
      // Process each selected day
      for (const day of selectedDays) {
        const dateString = format(day, 'yyyy-MM-dd');
        
        // Process each time slot
        for (const timeSlot of timeSlots) {
          // Calculate end time (30 minutes after start)
          const [hour, minute] = timeSlot.split(':');
          let endTimeHour = parseInt(hour);
          let endTimeMinute = parseInt(minute) + 30;
          
          if (endTimeMinute >= 60) {
            endTimeHour += 1;
            endTimeMinute = 0;
          }
          
          const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
          
          // Add to operations array
          operations.push({
            staff_id: selectedStaff,
            date: dateString,
            start_time: timeSlot,
            end_time: endTimeSlot,
            is_available: bulkStatus
          });
        }
      }
      
      // First delete existing records for these days and staff
      for (const day of selectedDays) {
        const dateString = format(day, 'yyyy-MM-dd');
        
        await supabase
          .from('staff_availability')
          .delete()
          .eq('staff_id', selectedStaff)
          .eq('date', dateString);
      }
      
      // Then insert all the new records in bulk
      await supabase
        .from('staff_availability')
        .insert(operations);
      
      // Refresh data
      window.location.reload();
      
    } catch (error) {
      console.error('Error applying bulk operation:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Staff Availability</h2>
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mr-4 text-gray-700 dark:text-gray-300">Week of: {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}</span>
        </div>
        
        {/* Bulk operations UI */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="bulkMode"
              checked={bulkMode}
              onChange={() => {
                setBulkMode(!bulkMode);
                if (!bulkMode) {
                  setSelectedDays([]);
                }
              }}
              className="mr-2 h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="bulkMode" className="text-sm text-gray-700 dark:text-gray-300">Bulk Edit Mode</label>
          </div>
          
          {bulkMode && (
            <>
              <select 
                value={selectedStaff || ''}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              
              <select
                value={bulkStatus ? 'available' : 'unavailable'}
                onChange={(e) => setBulkStatus(e.target.value === 'available')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              
              <button
                onClick={applyBulkOperation}
                disabled={!selectedStaff || selectedDays.length === 0}
                className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
              >
                Apply to {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 mr-2 border border-gray-200 dark:border-gray-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 mr-2 border border-gray-200 dark:border-gray-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Not Available</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Staff
              </th>
              {weekDays.map((day, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                    ${bulkMode ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''} 
                    ${bulkMode && selectedDays.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) 
                      ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                  onClick={() => bulkMode && toggleDaySelection(day)}
                >
                  {format(day, 'EEE')}
                  <br />
                  {format(day, 'MM/dd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {staff.map((staffMember) => (
              <tr key={staffMember.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {staffMember.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {staffMember.title}
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => (
                  <td key={dayIndex} className="px-2 py-2">
                    <div className="grid grid-cols-2 gap-1">
                      {timeSlots.map((timeSlot, timeIndex) => (
                        <div 
                          key={timeIndex} 
                          className={getTimeSlotClass(staffMember.id, day, timeSlot)}
                          onClick={() => !bulkMode && handleToggleAvailability(staffMember.id, day, timeSlot)}
                          title={`${format(day, 'MM/dd')} ${timeSlot} - ${staffMember.name}`}
                        ></div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {bulkMode 
            ? "Select days, staff, and availability status to apply in bulk. Click on column headers to select entire days." 
            : "Click on a time slot to toggle availability. Once blocked, a staff member cannot be booked until the scheduled time passes."}
        </p>
      </div>
    </div>
  );
} 