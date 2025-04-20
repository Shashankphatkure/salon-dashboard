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
  
  // Time slots for the day, spanning from 9 AM to 8 PM
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
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
      const startHour = slot.start.split(':')[0];
      const endHour = slot.end.split(':')[0];
      const slotHour = timeSlot.split(':')[0];
      
      return slot.isAvailable && 
        parseInt(slotHour) >= parseInt(startHour) && 
        parseInt(slotHour) < parseInt(endHour);
    });
  };

  // Determine the class for a time slot
  const getTimeSlotClass = (staffId, date, timeSlot) => {
    // Basic classes for all cells
    let classes = "h-8 w-full border border-gray-200 dark:border-gray-700 ";
    
    if (isStaffAvailable(staffId, date, timeSlot)) {
      classes += "bg-green-100 dark:bg-green-900/30 ";
    } else {
      classes += "bg-red-100 dark:bg-red-900/30 ";
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
      
      // Calculate end time (1 hour after start)
      const [hour] = timeSlot.split(':');
      const endTimeHour = parseInt(hour) + 1;
      const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:00`;
      
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
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="mr-4 text-gray-700 dark:text-gray-300">Week of: {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
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
                <th key={index} className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    <div className="grid grid-cols-4 gap-1">
                      {timeSlots.map((timeSlot, timeIndex) => (
                        <div 
                          key={timeIndex} 
                          className={getTimeSlotClass(staffMember.id, day, timeSlot)}
                          onClick={() => handleToggleAvailability(staffMember.id, day, timeSlot)}
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
          Click on a time slot to toggle availability. Once blocked, a staff member cannot be booked until the scheduled time passes.
        </p>
      </div>
    </div>
  );
} 