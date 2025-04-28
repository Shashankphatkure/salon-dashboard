'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';

export default function StaffAvailability({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availability, setAvailability] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [weekDays, setWeekDays] = useState([]);

  const supabase = createClientComponentClient();

  // Load availability data (called only when needed)
  const loadAvailabilityData = useCallback(async () => {
    if (!selectedStaff) return;
    
    try {
      setIsLoadingAvailability(true);
      
      // Fetch availability for selected staff for the current week
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');
      
      const { data: availData, error: availError } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', selectedStaff)
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (availError) throw availError;
      
      // Process availability data
      const availabilityMap = { ...availability };
      
      if (!availabilityMap[selectedStaff]) {
        availabilityMap[selectedStaff] = {};
      }
      
      availData.forEach(item => {
        if (!availabilityMap[selectedStaff][item.date]) {
          availabilityMap[selectedStaff][item.date] = [];
        }
        
        availabilityMap[selectedStaff][item.date].push({
          id: item.id,
          start: item.start_time,
          end: item.end_time,
          isAvailable: item.is_available
        });
      });
      
      setAvailability(availabilityMap);
      
      // Auto-clear any old status messages
      setStatusMessage({ type: '', message: '' });
    } catch (error) {
      console.error('Error fetching availability data:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to load availability data. Please try again.' 
      });
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [selectedStaff, weekDays, availability, supabase]);

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
                                e.stopPropagation();
                                setSelectedTime('');
                                setSelectedDuration(1);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Clear
                            </button>
                          </div>
                          
                          <div className="flex items-center">
                            <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Duration:</label>
                            <select
                              value={selectedDuration}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedDuration(parseInt(e.target.value, 10));
                              }}
                              className="py-1 px-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mr-3"
                              disabled={!selectedTime}
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
                            
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedTime && `${formatTime(selectedTime)} - ${formatTime(getEndTimeFromDuration(selectedTime, selectedDuration))}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {isSelected && getAvailableTimeSlots().map((time, index) => (
                          <button 
                            key={index}
                            type="button"
                            className={`px-3 py-1 text-xs rounded-full border ${
                              selectedTime === time
                                ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Selecting time slot:', time);
                              setSelectedTime(time);
                              setSelectedDuration(1); // Reset duration when changing time
                            }}
                          >
                            {formatTime(time)}
                          </button>
                        ))}
                        
                        {!isSelected && (
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // Group slots by hour for cleaner display
                              const timeGroups = {};
                              availableSlots.forEach(s => {
                                const hour = parseInt(s.start_time.split(':')[0], 10);
                                if (!timeGroups[hour]) timeGroups[hour] = [];
                                timeGroups[hour].push(s);
                              });
                              
                              return Object.entries(timeGroups).map(([hour, slots]) => (
                                <div key={hour} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                  {formatTime(`${hour}:00`)} - {slots.length} slot(s)
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
    </div>
  );
} 