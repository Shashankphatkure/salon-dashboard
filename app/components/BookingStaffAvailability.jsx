'use client';

import { useState, useEffect } from 'react';

export default function BookingStaffAvailability({
  staff = [],
  staffAvailability = [],
  selectedDate,
  selectedStaff,
  setSelectedStaff,
  selectedTime,
  setSelectedTime,
  selectedDuration,
  setSelectedDuration,
  getAvailableTimeSlots,
  canFitDuration,
  formatTime,
  formatDuration,
  getEndTimeFromDuration
}) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState({});
  const [timeBlockInfo, setTimeBlockInfo] = useState(null);
  
  // Update available time slots when staff changes
  useEffect(() => {
    if (selectedStaff && getAvailableTimeSlots) {
      const slots = getAvailableTimeSlots();
      setAvailableTimeSlots(slots);
      console.log('Available slots for selected staff:', slots);
    }
  }, [selectedStaff, getAvailableTimeSlots]);

  // Mock function to simulate time blocking logic
  // In a real app, this would use actual booking data from your database
  useEffect(() => {
    // Create demo blocks (this would come from your database in a real app)
    const mockBlockedSlots = {};
    
    staff.forEach(staffMember => {
      mockBlockedSlots[staffMember.id] = {};
      
      // Generate some random blocks for demo purposes
      if (Math.random() > 0.3) { // 70% chance to have blocks
        const numBlocks = Math.floor(Math.random() * 3) + 1; // 1-3 blocks
        
        for (let i = 0; i < numBlocks; i++) {
          const startHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
          const duration = Math.floor(Math.random() * 4) + 1; // 1-4 slots (30 min to 2 hours)
          
          // Block consecutive slots
          for (let j = 0; j < duration; j++) {
            const time = `${startHour + Math.floor(j/2)}:${j % 2 === 0 ? '00' : '30'}`;
            
            if (!mockBlockedSlots[staffMember.id][time]) {
              mockBlockedSlots[staffMember.id][time] = {
                customerName: ['Rahul', 'Priya', 'Amir', 'Neha', 'Vikram'][Math.floor(Math.random() * 5)],
                service: ['Haircut', 'Coloring', 'Styling', 'Spa', 'Facial'][Math.floor(Math.random() * 5)],
                endTime: duration,
                isActive: true,
                startTime: new Date().getTime() - (Math.random() * 3600000) // Random start time within last hour
              };
            }
          }
        }
      }
    });
    
    setBlockedSlots(mockBlockedSlots);
  }, [staff, selectedDate]);

  // Handle duration change directly
  const handleDurationChange = (e, timeSlot) => {
    e.stopPropagation();
    const newDuration = parseInt(e.target.value, 10);
    setSelectedDuration(newDuration);
  };

  // Check if time slots are consecutive
  const areConsecutiveSlots = (slot1, slot2) => {
    const [hour1, minute1] = slot1.split(':').map(num => parseInt(num, 10));
    const [hour2, minute2] = slot2.split(':').map(num => parseInt(num, 10));
    
    const totalMinutes1 = hour1 * 60 + minute1;
    const totalMinutes2 = hour2 * 60 + minute2;
    
    return totalMinutes2 - totalMinutes1 === 30;
  };

  // Show info for a blocked time slot
  const showBlockInfo = (e, staffId, time) => {
    e.stopPropagation();
    if (blockedSlots[staffId] && blockedSlots[staffId][time]) {
      setTimeBlockInfo({
        staffId,
        time,
        ...blockedSlots[staffId][time]
      });
    }
  };
  
  // Close the time block info popup
  const closeBlockInfo = () => {
    setTimeBlockInfo(null);
  };
  
  // Calculate remaining time for a block
  const getRemainingTime = (startTime) => {
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    
    // Mock timer - in a real app this would be based on actual appointment duration
    const totalDurationMs = 45 * 60 * 1000; // 45 minutes
    const remainingMs = totalDurationMs - elapsedMs;
    
    if (remainingMs <= 0) return 'Completed';
    
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return `${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''} remaining`;
  };

  // Generate 30-minute time slots for the day (9 AM to 8 PM)
  const getAllTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip 8:30 PM
        if (hour === 20 && minute === 30) continue;
        slots.push(`${hour}:${minute === 0 ? '00' : minute}`);
      }
    }
    return slots;
  };

  // Check if a time slot is available based on staffAvailability
  const isTimeSlotAvailable = (staffId, timeSlot) => {
    if (!staffId || !timeSlot) return false;
    
    const [hour, minute] = timeSlot.split(':').map(num => parseInt(num, 10));
    const slotMinutes = hour * 60 + (minute || 0);
    
    return staffAvailability.some(slot => {
      if (slot.staff_id !== staffId || slot.date !== selectedDate || !slot.is_available) {
        return false;
      }
      
      const startHour = parseInt(slot.start_time.split(':')[0], 10);
      const startMinute = parseInt(slot.start_time.split(':')[1] || 0, 10);
      const endHour = parseInt(slot.end_time.split(':')[0], 10);
      const endMinute = parseInt(slot.end_time.split(':')[1] || 0, 10);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  return (
    <div className="mt-4">
      {staff && staff.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(person => {
            const isSelected = selectedStaff && selectedStaff.id === person.id;
            const availableSlots = staffAvailability.filter(slot => 
              slot.staff_id === person.id && 
              slot.date === selectedDate &&
              slot.is_available
            );
            
            // Get all 30-minute slots for visualization
            const timeSlots = getAllTimeSlots();
            
            return (
              <div 
                key={person.id}
                className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => {
                  console.log('Selecting staff:', person.name);
                  setSelectedStaff(person);
                  // Reset selected time when switching staff
                  setSelectedTime('');
                  setSelectedDuration(1);
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{person.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{person.role || 'Staff'}</p>
                  </div>
                  <div className="ml-auto">
                    {availableSlots.length > 0 ? (
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
                
                {/* Time slot selection with duration */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Times:</h4>
                  {availableSlots.length > 0 ? (
                    <div>
                      {isSelected && selectedTime && (
                        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Selected time: {formatTime(selectedTime)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTime('');
                                setSelectedDuration(1);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Clear
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center">
                            <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Duration:</label>
                            <select
                              value={selectedDuration}
                              onChange={(e) => handleDurationChange(e, selectedTime)}
                              className="py-1 px-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mr-3"
                              disabled={!selectedTime}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {[...Array(12)].map((_, i) => {
                                const slots = i + 1;
                                return (
                                  <option 
                                    key={slots} 
                                    value={slots}
                                    disabled={!canFitDuration(selectedTime, getAvailableTimeSlots(), slots)}
                                  >
                                    {formatDuration(slots)}
                                  </option>
                                );
                              })}
                            </select>
                            
                            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-0">
                              {selectedTime && `${formatTime(selectedTime)} - ${formatTime(getEndTimeFromDuration(selectedTime, selectedDuration))}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Time slots visualization - shows both available and blocked slots */}
                      <div className="mb-4">
                        <h5 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Today's Schedule:</h5>
                        
                        
                        {/* Legend */}
                        <div className="mt-2 flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded mr-1"></div>
                            <span className="text-gray-600 dark:text-gray-400">Available</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded mr-1"></div>
                            <span className="text-gray-600 dark:text-gray-400">Booked</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-600 dark:bg-purple-700 rounded mr-1"></div>
                            <span className="text-gray-600 dark:text-gray-400">Selected</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {isSelected && (
                          <>
                            {getAvailableTimeSlots().map((time, index) => {
                              // Determine if this slot would be included in selected time range
                              const isInSelectedRange = selectedTime && selectedDuration > 1 ? (() => {
                                // Convert selected time to minutes
                                const [startHour, startMinute] = selectedTime.split(':').map(num => parseInt(num, 10));
                                const startTotalMinutes = startHour * 60 + startMinute;
                                
                                // Convert current time slot to minutes
                                const [timeHour, timeMinute] = time.split(':').map(num => parseInt(num, 10));
                                const timeTotalMinutes = timeHour * 60 + timeMinute;
                                
                                // Check if this slot falls within the selected duration range
                                return timeTotalMinutes > startTotalMinutes && 
                                      timeTotalMinutes < startTotalMinutes + (selectedDuration * 30);
                              })() : false;
                              
                              // Check if the time slot is blocked
                              const isBlocked = blockedSlots[person.id] && blockedSlots[person.id][time];
                              // Check if available via staff_availability
                              const isAvailable = isTimeSlotAvailable(person.id, time);
                              
                              return (
                                <div
                                  key={`${person.id}-${time}`}
                                  className={`
                                    rounded-md px-2 py-1 cursor-pointer text-center text-sm
                                    ${time === selectedTime ? 'bg-purple-500 text-white' : 
                                      isInSelectedRange ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                      isBlocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                                      !isAvailable ? 'bg-red-100 text-red-600 cursor-not-allowed' :
                                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
                                    }
                                    ${time === selectedTime ? 'font-bold' : 'font-medium'}
                                    transition-colors
                                  `}
                                  onClick={(e) => {
                                    // Stop propagation to prevent staff selection
                                    e.stopPropagation();
                                    
                                    if (isBlocked) {
                                      showBlockInfo(e, person.id, time);
                                    } else if (!isAvailable) {
                                      // Show a tooltip or message about the slot being booked
                                      alert('This time slot is already booked.');
                                    } else {
                                      console.log('Selecting time slot:', time);
                                      
                                      // Always set the time first
                                      if (selectedTime === time) {
                                        // If selecting the same time, clear it
                                        setSelectedTime('');
                                        setSelectedDuration(1);
                                      } else {
                                        // Set the new time immediately
                                        setSelectedTime(time);
                                        
                                        // Then calculate appropriate duration
                                        const availableSlots = getAvailableTimeSlots();
                                        if (availableSlots.includes(time)) {
                                          const timeIndex = availableSlots.indexOf(time);
                                          
                                          // Set maximum duration based on available consecutive slots
                                          let maxDuration = 1;
                                          let nextSlotIndex = timeIndex + 1;
                                          
                                          while (
                                            nextSlotIndex < availableSlots.length && 
                                            areConsecutiveSlots(availableSlots[nextSlotIndex - 1], availableSlots[nextSlotIndex])
                                          ) {
                                            maxDuration++;
                                            nextSlotIndex++;
                                          }
                                          
                                          console.log(`Max duration for ${time}: ${maxDuration} slots`);
                                          // Ensure duration doesn't exceed what's available
                                          setSelectedDuration(Math.min(selectedDuration, maxDuration));
                                        } else {
                                          // Fallback if the slot isn't in availableSlots (shouldn't happen)
                                          setSelectedDuration(1);
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <span className="block text-sm font-medium">{formatTime(time)}</span>
                                </div>
                              );
                            })}
                          </>
                        )}
                        
                        {!isSelected && (
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // Group slots by hour for cleaner display
                              const timeGroups = {};
                              availableSlots.forEach(s => {
                                const startHour = parseInt(s.start_time.split(':')[0], 10);
                                const endHour = parseInt(s.end_time.split(':')[0], 10);
                                const startMinute = parseInt(s.start_time.split(':')[1], 10) || 0;
                                const endMinute = parseInt(s.end_time.split(':')[1], 10) || 0;
                                
                                // Calculate 30-minute slots in this availability block
                                const startTotalMinutes = startHour * 60 + startMinute;
                                const endTotalMinutes = endHour * 60 + endMinute;
                                const numSlots = Math.floor((endTotalMinutes - startTotalMinutes) / 30);
                                
                                for (let h = startHour; h <= endHour; h++) {
                                  if (!timeGroups[h]) timeGroups[h] = 0;
                                  
                                  // Count full hours
                                  if (h > startHour && h < endHour) {
                                    timeGroups[h] += 2; // 2 slots per hour
                                  } 
                                  // Start hour
                                  else if (h === startHour) {
                                    timeGroups[h] += startMinute === 0 ? 2 : 1;
                                  }
                                  // End hour
                                  else if (h === endHour) {
                                    timeGroups[h] += endMinute === 0 ? 0 : 1;
                                  }
                                }
                              });
                              
                              return Object.entries(timeGroups)
                                .filter(([_, count]) => count > 0)
                                .map(([hour, count]) => (
                                  <div key={hour} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                    {formatTime(`${hour}:00`)} - {count} slot{count !== 1 ? 's' : ''}
                                  </div>
                                ));
                            })()}
                          </div>
                        )}
                      </div>
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
      
      {/* Time block info popup */}
      {timeBlockInfo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={closeBlockInfo}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Booked Time Slot
              </h3>
              <button
                onClick={closeBlockInfo}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {formatTime(timeBlockInfo.time)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This time slot is currently booked
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Customer Name:</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{timeBlockInfo.customerName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{timeBlockInfo.service}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {timeBlockInfo.isActive ? 'In Progress' : 'Scheduled'}
                </span>
              </div>
              {timeBlockInfo.isActive && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Remaining Time:</span>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {getRemainingTime(timeBlockInfo.startTime)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={closeBlockInfo}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}