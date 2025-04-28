'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';

export default function StaffAvailability() {
  const supabase = createClientComponentClient();
  const [staff, setStaff] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day', or 'staff'
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([
    { id: 'fullday', name: 'Full Day (9AM-8PM)' },
    { id: 'morning', name: 'Morning (9AM-1PM)' },
    { id: 'afternoon', name: 'Afternoon (1PM-5PM)' },
    { id: 'evening', name: 'Evening (5PM-8PM)' },
    { id: 'weekday', name: 'Weekday Schedule' },
    { id: 'weekend', name: 'Weekend Schedule' },
  ]);
  
  // Generate time slots for the day, spanning from 9 AM to 8 PM with 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) { // Don't add :30 for the last hour
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(currentWeekStart, i)
  );
  
  // Format time for display
  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes === '00' ? '00' : minutes} ${suffix}`;
  };
  
  // Get day name
  const getDayName = (date) => {
    return format(date, 'EEEE');
  };

  // Load staff and availability data
  const loadData = useCallback(async () => {
      try {
        setIsLoading(true);
      setStatusMessage({ type: '', message: '' });
        
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
          id: item.id,
            start: item.start_time,
            end: item.end_time,
            isAvailable: item.is_available
          });
        });
        
        setStaff(staffData || []);
        setAvailability(availabilityMap);
        
      // Set default selected staff if none is selected
      if (staffData && staffData.length > 0 && !selectedStaff) {
        setSelectedStaff(staffData[0].id);
      }
      
      } catch (error) {
        console.error('Error fetching data:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to load staff availability data. Please try again.' 
      });
      } finally {
        setIsLoading(false);
      }
  }, [currentWeekStart, weekDays, selectedStaff]);

  // Initialize and load data when component mounts or week changes
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Get available slots count for a day
  const getAvailableSlotsCount = (staffId, date) => {
    if (!staffId) return 0;
    
    let count = 0;
    for (const timeSlot of timeSlots) {
    if (isStaffAvailable(staffId, date, timeSlot)) {
        count++;
      }
    }
    
    return count;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Select a specific day to view
  const viewDay = (day) => {
    setSelectedDay(day);
    setViewMode('day');
  };

  // View all days (week view)
  const viewWeek = () => {
    setSelectedDay(null);
    setViewMode('week');
  };

  // View a specific staff member
  const viewStaffMember = (staffId) => {
    setSelectedStaff(staffId);
    setViewMode('staff');
  };

  // Toggle availability for a specific time slot
  const toggleTimeSlot = async (staffId, date, timeSlot) => {
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
      
      // Find existing slot if any
      const staffAvail = availability[staffId]?.[dateString] || [];
      const existingSlotIndex = staffAvail.findIndex(slot => {
        const [startHour, startMinute] = slot.start.split(':').map(num => parseInt(num, 10));
        const slotStartTotalMinutes = startHour * 60 + startMinute;
        
        const [timeHour, timeMinute] = timeSlot.split(':').map(num => parseInt(num, 10));
        const timeTotalMinutes = timeHour * 60 + timeMinute;
        
        return slotStartTotalMinutes === timeTotalMinutes;
      });
      
      // Update database
      if (existingSlotIndex >= 0) {
        // Update existing record
        const existingSlot = staffAvail[existingSlotIndex];
        await supabase
          .from('staff_availability')
          .update({ is_available: newAvailabilityStatus })
          .eq('id', existingSlot.id);
          
        // Update local state
        const newAvailability = { ...availability };
        newAvailability[staffId][dateString][existingSlotIndex].isAvailable = newAvailabilityStatus;
        setAvailability(newAvailability);
      } else {
        // Insert new record
        const { data: newSlot, error } = await supabase
          .from('staff_availability')
          .insert({
            staff_id: staffId,
            date: dateString,
            start_time: timeSlot,
            end_time: endTimeSlot,
            is_available: newAvailabilityStatus
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
      const newAvailability = { ...availability };
      if (!newAvailability[staffId]) {
        newAvailability[staffId] = {};
      }
      if (!newAvailability[staffId][dateString]) {
        newAvailability[staffId][dateString] = [];
      }
      
      newAvailability[staffId][dateString].push({
          id: newSlot.id,
        start: timeSlot,
        end: endTimeSlot,
        isAvailable: newAvailabilityStatus
      });
      
      setAvailability(newAvailability);
      }
      
      setStatusMessage({ 
        type: 'success', 
        message: `Time slot ${formatTimeDisplay(timeSlot)} set to ${newAvailabilityStatus ? 'available' : 'unavailable'}` 
      });
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(prev => prev.type === 'success' ? { type: '', message: '' } : prev);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating availability:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to update time slot. Please try again.' 
      });
    }
  };

  // Set availability for all time slots for a day
  const setDayAvailability = async (staffId, date, isAvailable) => {
    try {
      setIsSaving(true);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Delete all existing slots for this staff and date
      await supabase
        .from('staff_availability')
        .delete()
        .eq('staff_id', staffId)
        .eq('date', dateString);
      
      // Create new slots for all times
      const slots = [];
      for (const timeSlot of timeSlots) {
        // Calculate end time
        const [hour, minute] = timeSlot.split(':');
        let endTimeHour = parseInt(hour);
        let endTimeMinute = parseInt(minute) + 30;
        
        if (endTimeMinute >= 60) {
          endTimeHour += 1;
          endTimeMinute = 0;
        }
        
        const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          staff_id: staffId,
          date: dateString,
          start_time: timeSlot,
          end_time: endTimeSlot,
          is_available: isAvailable
        });
      }
      
      // Insert all slots in one batch
      const { data: newSlots, error } = await supabase
        .from('staff_availability')
        .insert(slots)
        .select();
        
      if (error) throw error;
      
      // Refresh data instead of manually updating local state
      await loadData();
      
      setStatusMessage({ 
        type: 'success', 
        message: `Set all time slots for ${format(date, 'MMM dd')} to ${isAvailable ? 'available' : 'unavailable'}` 
      });
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(prev => prev.type === 'success' ? { type: '', message: '' } : prev);
      }, 3000);
      
    } catch (error) {
      console.error('Error setting day availability:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to update day availability. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy availability from one day to another
  const copyDayAvailability = async (staffId, sourceDate, targetDate) => {
    try {
      setIsSaving(true);
      const sourceDateString = format(sourceDate, 'yyyy-MM-dd');
      const targetDateString = format(targetDate, 'yyyy-MM-dd');
      
      // Get source day availability
      const sourceAvail = availability[staffId]?.[sourceDateString] || [];
      
      if (sourceAvail.length === 0) {
        setStatusMessage({ 
          type: 'warning', 
          message: 'No availability data to copy from the source day.' 
        });
        return;
      }
      
      // Delete existing slots for target day
      await supabase
        .from('staff_availability')
        .delete()
        .eq('staff_id', staffId)
        .eq('date', targetDateString);
      
      // Create new slots based on source day
      const slots = sourceAvail.map(slot => ({
        staff_id: staffId,
        date: targetDateString,
        start_time: slot.start,
        end_time: slot.end,
        is_available: slot.isAvailable
      }));
      
      // Insert all slots in one batch
      const { data: newSlots, error } = await supabase
        .from('staff_availability')
        .insert(slots)
        .select();
        
      if (error) throw error;
      
      // Refresh data
      await loadData();
      
      setStatusMessage({ 
        type: 'success', 
        message: `Copied availability from ${format(sourceDate, 'MMM dd')} to ${format(targetDate, 'MMM dd')}` 
      });
      
    } catch (error) {
      console.error('Error copying day availability:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to copy availability. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy availability from one staff to another for the same day
  const copyStaffAvailability = async (sourceStaffId, targetStaffId, date) => {
    try {
      setIsSaving(true);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Get source staff availability
      const sourceAvail = availability[sourceStaffId]?.[dateString] || [];
      
      if (sourceAvail.length === 0) {
        setStatusMessage({ 
          type: 'warning', 
          message: 'No availability data to copy from the source staff.' 
        });
        return;
      }
      
      // Delete existing slots for target staff on this day
      await supabase
        .from('staff_availability')
        .delete()
        .eq('staff_id', targetStaffId)
        .eq('date', dateString);
      
      // Create new slots based on source staff
      const slots = sourceAvail.map(slot => ({
        staff_id: targetStaffId,
        date: dateString,
        start_time: slot.start,
        end_time: slot.end,
        is_available: slot.isAvailable
      }));
      
      // Insert all slots in one batch
      const { data: newSlots, error } = await supabase
        .from('staff_availability')
        .insert(slots)
        .select();
        
      if (error) throw error;
      
      // Refresh data
      await loadData();
      
      const sourceStaffName = staff.find(s => s.id === sourceStaffId)?.name || 'Source staff';
      const targetStaffName = staff.find(s => s.id === targetStaffId)?.name || 'Target staff';
      
      setStatusMessage({ 
        type: 'success', 
        message: `Copied availability from ${sourceStaffName} to ${targetStaffName} for ${format(date, 'MMM dd')}` 
      });
      
    } catch (error) {
      console.error('Error copying staff availability:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to copy staff availability. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Apply a template to a day
  const applyTemplate = async (staffId, date, templateId) => {
    try {
      setIsSaving(true);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Delete existing slots
      await supabase
        .from('staff_availability')
        .delete()
        .eq('staff_id', staffId)
        .eq('date', dateString);
      
      // Generate slots based on the template
      const slots = [];
      
      switch(templateId) {
        case 'fullday':
          // 9 AM to 8 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            let endTimeHour = parseInt(hour);
            let endTimeMinute = parseInt(minute) + 30;
            
            if (endTimeMinute >= 60) {
              endTimeHour += 1;
              endTimeMinute = 0;
            }
            
            const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
            
            slots.push({
              staff_id: staffId,
              date: dateString,
              start_time: timeSlot,
              end_time: endTimeSlot,
              is_available: true
            });
          }
          break;
          
        case 'morning':
          // 9 AM to 1 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            const hourNum = parseInt(hour);
            
            if (hourNum >= 9 && hourNum < 13) {
              let endTimeHour = hourNum;
              let endTimeMinute = parseInt(minute) + 30;
              
              if (endTimeMinute >= 60) {
                endTimeHour += 1;
                endTimeMinute = 0;
              }
              
              const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
              
              slots.push({
                staff_id: staffId,
                date: dateString,
                start_time: timeSlot,
                end_time: endTimeSlot,
                is_available: true
              });
            }
          }
          break;
          
        case 'afternoon':
          // 1 PM to 5 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            const hourNum = parseInt(hour);
            
            if (hourNum >= 13 && hourNum < 17) {
              let endTimeHour = hourNum;
              let endTimeMinute = parseInt(minute) + 30;
              
              if (endTimeMinute >= 60) {
                endTimeHour += 1;
                endTimeMinute = 0;
              }
              
              const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
              
              slots.push({
                staff_id: staffId,
                date: dateString,
                start_time: timeSlot,
                end_time: endTimeSlot,
                is_available: true
              });
            }
          }
          break;
          
        case 'evening':
          // 5 PM to 8 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            const hourNum = parseInt(hour);
            
            if (hourNum >= 17 && hourNum <= 20) {
              let endTimeHour = hourNum;
              let endTimeMinute = parseInt(minute) + 30;
              
              if (endTimeMinute >= 60) {
                endTimeHour += 1;
                endTimeMinute = 0;
              }
              
              const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
              
              slots.push({
                staff_id: staffId,
                date: dateString,
                start_time: timeSlot,
                end_time: endTimeSlot,
                is_available: true
              });
            }
          }
          break;
          
        case 'weekday':
          // 9 AM to 5 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            const hourNum = parseInt(hour);
            
            if (hourNum >= 9 && hourNum < 17) {
              let endTimeHour = hourNum;
              let endTimeMinute = parseInt(minute) + 30;
              
              if (endTimeMinute >= 60) {
                endTimeHour += 1;
                endTimeMinute = 0;
              }
              
              const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
              
              slots.push({
                staff_id: staffId,
                date: dateString,
                start_time: timeSlot,
                end_time: endTimeSlot,
                is_available: true
              });
            }
          }
          break;
          
        case 'weekend':
          // 10 AM to 6 PM
          for (const timeSlot of timeSlots) {
            const [hour, minute] = timeSlot.split(':');
            const hourNum = parseInt(hour);
            
            if (hourNum >= 10 && hourNum < 18) {
              let endTimeHour = hourNum;
              let endTimeMinute = parseInt(minute) + 30;
              
              if (endTimeMinute >= 60) {
                endTimeHour += 1;
                endTimeMinute = 0;
              }
              
              const endTimeSlot = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
              
              slots.push({
                staff_id: staffId,
                date: dateString,
                start_time: timeSlot,
                end_time: endTimeSlot,
                is_available: true
              });
            }
          }
          break;
          
        default:
          break;
      }
      
      if (slots.length > 0) {
        // Insert all slots in one batch
        const { data: newSlots, error } = await supabase
          .from('staff_availability')
          .insert(slots)
          .select();
          
        if (error) throw error;
      }
      
      // Refresh data
      await loadData();
      
      const templateName = templates.find(t => t.id === templateId)?.name || templateId;
      
      setStatusMessage({ 
        type: 'success', 
        message: `Applied ${templateName} template to ${format(date, 'MMM dd')}` 
      });
      
    } catch (error) {
      console.error('Error applying template:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to apply template. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
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
    
    return classes;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Staff Availability</h2>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Staff Availability</h2>
      
      {/* Status message */}
      {statusMessage.message && (
        <div className={`mb-4 p-4 rounded-lg ${
          statusMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
          statusMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
          'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      {/* Navigation and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          {/* Week Navigation */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Previous week"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </span>
            
            <button 
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Next week"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={goToCurrentWeek}
              className="ml-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Today
            </button>
          </div>
          
          {/* View Selector */}
          <div className="flex">
            <button 
              onClick={viewWeek}
              className={`px-4 py-2 text-sm rounded-l-lg ${
                viewMode === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week View
            </button>
            <button 
              onClick={() => viewMode === 'day' ? viewWeek() : viewDay(new Date())}
              className={`px-4 py-2 text-sm ${
                viewMode === 'day' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Day View
            </button>
            <button 
              onClick={() => viewMode === 'staff' ? viewWeek() : viewStaffMember(selectedStaff || staff[0]?.id)}
              className={`px-4 py-2 text-sm rounded-r-lg ${
                viewMode === 'staff' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Staff View
            </button>
          </div>
          
          {/* Staff Selector */}
          <div className="flex items-center">
            <label htmlFor="staff-select" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
              Staff:
            </label>
            <select 
              id="staff-select"
              value={selectedStaff || ''}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Controls for current view */}
        {viewMode === 'day' && selectedDay && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="flex-grow"></div>
            
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                if (e.target.value) {
                  applyTemplate(selectedStaff, selectedDay, e.target.value);
                  setSelectedTemplate('');
                }
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Apply Template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setDayAvailability(selectedStaff, selectedDay, true)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              disabled={isSaving}
            >
              All Available
            </button>
            
            <button
              onClick={() => setDayAvailability(selectedStaff, selectedDay, false)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={isSaving}
            >
              All Unavailable
            </button>
            
            <button
              onClick={() => viewWeek()}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Back to Week
            </button>
          </div>
        )}
        
        {viewMode === 'staff' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {staff.find(s => s.id === selectedStaff)?.name || 'Staff Member'}
            </h3>
            
            <div className="flex-grow"></div>
            
            <button
              onClick={() => viewWeek()}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Back to Week
            </button>
          </div>
        )}
      </div>
      
      {/* Main Content Area - Week View */}
      {viewMode === 'week' && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                Staff
              </th>
              {weekDays.map((day, index) => (
                  <th 
                    key={index} 
                    className="px-2 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => viewDay(day)}
                  >
                    <div className="flex flex-col items-center">
                      <span>{format(day, 'EEE')}</span>
                      <span className="text-sm font-bold mt-1">{format(day, 'MMM d')}</span>
                    </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {staff.map((staffMember) => (
              <tr key={staffMember.id}>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => viewStaffMember(staffMember.id)}
                  >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {staffMember.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {staffMember.title}
                  </div>
                </td>
                  {weekDays.map((day, dayIndex) => {
                    const availableCount = getAvailableSlotsCount(staffMember.id, day);
                    const totalSlots = timeSlots.length;
                    const availabilityPercentage = Math.round((availableCount / totalSlots) * 100);
                    
                    return (
                      <td 
                        key={dayIndex} 
                        className="px-2 py-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => {
                          setSelectedStaff(staffMember.id);
                          viewDay(day);
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 h-16 mb-2">
                            <svg viewBox="0 0 36 36" className="w-full h-full">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={availableCount > 0 ? "#d1fae5" : "#fee2e2"}
                                strokeWidth="3"
                                strokeDasharray="100, 100"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={availableCount > 0 ? "#10b981" : "#ef4444"}
                                strokeWidth="3"
                                strokeDasharray={`${availabilityPercentage}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                              {availableCount > 0 ? 
                                <span className="text-green-600 dark:text-green-400">{availableCount}</span> : 
                                <span className="text-red-600 dark:text-red-400">0</span>
                              }
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {availableCount} / {totalSlots} slots
                          </span>
                          {availableCount > 0 && (
                            <div className="mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                              Available
                            </div>
                          )}
                          {availableCount === 0 && (
                            <div className="mt-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full">
                              Unavailable
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Day View */}
      {viewMode === 'day' && selectedDay && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {staff.find(s => s.id === selectedStaff)?.name || 'Staff'} - {format(selectedDay, 'MMMM d, yyyy')}
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                {timeSlots.map((timeSlot, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {formatTimeDisplay(timeSlot)}
                    </div>
                    <div 
                      className={getTimeSlotClass(selectedStaff, selectedDay, timeSlot)}
                      onClick={() => toggleTimeSlot(selectedStaff, selectedDay, timeSlot)}
                      title={`${formatTimeDisplay(timeSlot)} - ${isStaffAvailable(selectedStaff, selectedDay, timeSlot) ? 'Available' : 'Unavailable'}`}
                      style={{ height: '40px' }}
                        ></div>
                    <div className="text-xs mt-1">
                      {isStaffAvailable(selectedStaff, selectedDay, timeSlot) ? 
                        <span className="text-green-600 dark:text-green-400">Available</span> : 
                        <span className="text-red-600 dark:text-red-400">Unavailable</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Copy tools for day view */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Copy Tools</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Copy to other days */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Copy to Another Day</h5>
                <div className="flex flex-wrap gap-3 mb-4">
                  {weekDays.map((day, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        isSameDay(day, selectedDay) 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                      }`}
                      onClick={() => !isSameDay(day, selectedDay) && copyDayAvailability(selectedStaff, selectedDay, day)}
                      disabled={isSameDay(day, selectedDay) || isSaving}
                    >
                      {format(day, 'EEE, MMM d')}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Copy to other staff */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Copy to Another Staff</h5>
                <div className="flex flex-wrap gap-3">
                  {staff.map((staffMember) => (
                    <button
                      key={staffMember.id}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        staffMember.id === selectedStaff 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40'
                      }`}
                      onClick={() => staffMember.id !== selectedStaff && copyStaffAvailability(selectedStaff, staffMember.id, selectedDay)}
                      disabled={staffMember.id === selectedStaff || isSaving}
                    >
                      {staffMember.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Staff View */}
      {viewMode === 'staff' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                  Day
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {weekDays.map((day, dayIndex) => {
                const availableCount = getAvailableSlotsCount(selectedStaff, day);
                const totalSlots = timeSlots.length;
                
                return (
                  <tr key={dayIndex}>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => viewDay(day)}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(day, 'EEEE')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(day, 'MMMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-4 ${availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${(availableCount / totalSlots) * 100}%` }}
                          ></div>
                        </div>
                        <div className="ml-4 text-sm">
                          {availableCount} / {totalSlots} slots
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mr-2"
                        onClick={() => viewDay(day)}
                      >
                        Edit
                      </button>
                      <select
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            applyTemplate(selectedStaff, day, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Templates</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      )}
      
      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {viewMode === 'week' 
            ? "Click on a day column to view and edit detailed availability. Click on a staff name to view their full week." 
            : viewMode === 'day'
            ? "Click on time slots to toggle availability. Use templates and copy tools to quickly set schedules."
            : "Select a day to edit detailed availability or apply templates to multiple days at once."}
        </p>
      </div>
    </div>
  );
} 