import { supabase } from './supabase';

// Membership Functions
export async function getMembershipPlans() {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .order('price');
    
  if (error) throw error;
  return data;
}

export async function getUserMembership(userId) {
  const { data, error } = await supabase
    .from('user_memberships')
    .select(`
      *,
      membership_plans(*)
    `)
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGSQL_ERROR_NOT_FOUND') throw error;
  return data;
}

export async function upgradeMembership(userId, planId, previousPlanId) {
  // Start a transaction to handle the upgrade
  const { data, error } = await supabase.rpc('upgrade_membership', {
    p_user_id: userId,
    p_new_plan_id: planId,
    p_old_plan_id: previousPlanId
  });
  
  if (error) throw error;
  return data;
}

// Plan migration function for upgrading from Silver to Silver Plus to Gold
export async function migratePlan(customerId, newPlanType) {
  // Validate the plan type
  const validPlanTypes = ['Silver', 'Silver Plus', 'Gold'];
  if (!validPlanTypes.includes(newPlanType)) {
    throw new Error('Invalid plan type. Must be Silver, Silver Plus, or Gold.');
  }
  
  try {
    // Get the customer's current membership
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('membership_type')
      .eq('id', customerId)
      .single();
      
    if (customerError) throw customerError;
    
    const currentPlan = customerData.membership_type;
    
    // Get current points balance
    const { data: membershipData, error: membershipError } = await supabase
      .from('memberships')
      .select('points_balance')
      .eq('customer_id', customerId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    // Might not find a record if customer has no membership yet
    const currentPoints = membershipData?.points_balance || 0;
    
    // Perform the migration
    const { data, error } = await supabase.rpc('migrate_membership_plan', {
      p_customer_id: customerId,
      p_from_plan: currentPlan,
      p_to_plan: newPlanType,
      p_points_to_carry: currentPoints
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: `Successfully migrated from ${currentPlan} to ${newPlanType} with ${currentPoints} points carried forward.`,
      fromPlan: currentPlan,
      toPlan: newPlanType,
      pointsCarried: currentPoints
    };
  } catch (error) {
    console.error('Error during plan migration:', error);
    throw error;
  }
}

// Customer Functions
export async function getCustomers(userId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getCustomerById(customerId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id, password) {
  // We'll implement a stored procedure to verify the password and delete if authorized
  const { data, error } = await supabase.rpc('delete_with_password', {
    p_table: 'customers',
    p_id: id,
    p_password: password
  });
  
  if (error) throw error;
  return data;
}

// Service Functions
export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function getServiceById(serviceId) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createService(service) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateService(serviceId, updates) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', serviceId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteService(serviceId) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);
    
  if (error) throw error;
  return true;
}

// Staff Functions
export async function getStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function getStaffById(staffId) {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createStaff(staff) {
  // First create the staff member
  const { data, error } = await supabase
    .from('staff')
    .insert([{
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      title: staff.title || staff.role,
      description: staff.bio,
      specialties: staff.specialties || [],
      profile_image: staff.image_url,
      active: staff.is_available
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
}

export async function updateStaff(staffId, updates) {
  // Update staff details
  const { data, error } = await supabase
    .from('staff')
    .update({
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      title: updates.title || updates.role,
      description: updates.bio,
      specialties: updates.specialties || [],
      profile_image: updates.image_url,
      active: updates.is_available
    })
    .eq('id', staffId)
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
}

export async function deleteStaff(staffId, password) {
  // Use direct deletion instead of a stored procedure if it's not available
  try {
    // First delete related availability records
    const { error: availabilityError } = await supabase
      .from('staff_availability')
      .delete()
      .eq('staff_id', staffId);
      
    if (availabilityError) throw availabilityError;
    
    // Then delete the staff record
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting staff: ", error);
    throw error;
  }
}

export async function getStaffAvailability(date) {
  // Convert date to ISO format
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('staff_availability')
    .select(`
      *,
      staff(*)
    `)
    .eq('date', formattedDate);
    
  if (error) throw error;
  return data;
}

export async function updateStaffAvailability(staffId, date, timeSlots) {
  // First delete existing slots
  const { error: deleteError } = await supabase
    .from('staff_availability')
    .delete()
    .eq('staff_id', staffId)
    .eq('date', date);
    
  if (deleteError) throw deleteError;
  
  // Then insert new slots
  const slots = timeSlots.map(slot => {
    // Parse start time
    const [startHour, startMinute] = slot.start.split(':').map(num => parseInt(num, 10));
    
    // Calculate end time (30 minutes after start by default)
    let endHour = startHour;
    let endMinute = (startMinute || 0) + 30;
    
    if (endMinute >= 60) {
      endHour += 1;
      endMinute = 0;
    }
    
    // If specific end time provided, use it
    if (slot.end) {
      const [providedEndHour, providedEndMinute] = slot.end.split(':').map(num => parseInt(num, 10));
      endHour = providedEndHour;
      endMinute = providedEndMinute || 0;
    }
    
    // Format times properly
    const formattedStartTime = `${startHour.toString().padStart(2, '0')}:${(startMinute || 0).toString().padStart(2, '0')}`;
    const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    return {
      staff_id: staffId,
      date,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      is_available: slot.available
    };
  });
  
  const { data, error } = await supabase
    .from('staff_availability')
    .insert(slots)
    .select();
    
  if (error) throw error;
  return data;
}

// Appointment Functions
export async function createAppointment(appointment, services = [], products = []) {
  try {
    // Create the appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointment])
      .select('*')
      .single();
      
    if (appointmentError) throw appointmentError;
    
    // Create appointment services if any
    if (services.length > 0) {
      const appointmentServices = services.map(service => ({
        appointment_id: appointmentData.id,
        service_id: service.id,
        price: service.price
      }));
      
      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);
        
      if (servicesError) throw servicesError;
    }
    
    // Create appointment products if any
    if (products.length > 0) {
      const appointmentProducts = products.map(product => ({
        appointment_id: appointmentData.id,
        product_id: product.id,
        price: product.price
      }));
      
      const { error: productsError } = await supabase
        .from('appointment_products')
        .insert(appointmentProducts);
        
      if (productsError) throw productsError;
    }
    
    // Return the appointment with additional data
    return {
      ...appointmentData,
      services_count: services.length,
      products_count: products.length
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function getAppointments(filters = {}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customers!customer_id(*),
      staff!staff_id(*),
      services:appointment_services(
        service:services(*)
      )
    `);
  
  // Apply filters if provided
  if (filters.date) {
    query = query.eq('date', filters.date);
  }
  
  if (filters.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }
  
  if (filters.staffId) {
    query = query.eq('staff_id', filters.staffId);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  query = query.order('date', { ascending: true })
               .order('start_time', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

// Update an appointment
export async function updateAppointment(appointmentId, updates) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select(`
      *,
      customers!customer_id(*),
      staff!staff_id(*),
      services:appointment_services(
        service:services(*)
      )
    `)
    .single();
  
  if (error) throw error;
  return data;
}

// Get a single appointment by ID
export async function getAppointmentById(appointmentId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customers!customer_id(*),
      staff!staff_id(*),
      services:appointment_services(
        service:services(*)
      )
    `)
    .eq('id', appointmentId)
    .single();
  
  if (error) throw error;
  return data;
}

// Reports Functions
export async function getStaffPerformance(startDate, endDate) {
  const { data, error } = await supabase.rpc('get_staff_performance', {
    p_start_date: startDate,
    p_end_date: endDate
  });
  
  if (error) throw error;
  return data;
}

export async function getSalesReport(startDate, endDate) {
  // This function doesn't exist in the database - implement getFilteredAppointments instead
  console.warn('getSalesReport is deprecated, use getFilteredAppointments instead');
  return [];
}

export async function getFilteredAppointments(params) {
  const { 
    p_date_from, 
    p_date_to, 
    p_status, 
    p_customer_id, 
    p_staff_id, 
    p_limit = 100, 
    p_offset = 0 
  } = params;
  
  // Use a direct query with table aliases instead of RPC function
  let query = supabase
    .from('appointments')
    .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      notes,
      total_amount,
      created_at,
      updated_at,
      customer_id,
      customers!customer_id(name, phone, email),
      staff!staff_id(name, email),
      appointment_services!inner(id)
    `, { count: 'exact' });
  
  // Apply filters
  if (p_date_from) {
    query = query.gte('date', p_date_from);
  }
  
  if (p_date_to) {
    query = query.lte('date', p_date_to);
  }
  
  if (p_status) {
    query = query.eq('status', p_status);
  }
  
  if (p_customer_id) {
    query = query.eq('customer_id', p_customer_id);
  }
  
  if (p_staff_id) {
    query = query.eq('staff_id', p_staff_id);
  }
  
  // Add ordering
  query = query.order('date', { ascending: false })
               .order('start_time', { ascending: true });
  
  // Add pagination
  query = query.range(p_offset, p_offset + p_limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching filtered appointments:', error);
    throw error;
  }
  
  // Transform the data to match the expected format
  const transformedData = data.map(appointment => {
    const customer = appointment.customers || {};
    const staff = appointment.staff || {};
    const serviceCount = appointment.appointment_services ? appointment.appointment_services.length : 0;
    
    return {
      id: appointment.id,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      total_amount: appointment.total_amount,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      customer_id: appointment.customer_id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      staff_id: appointment.staff_id,
      staff_name: staff.name,
      staff_email: staff.email,
      service_count: serviceCount
    };
  });
  
  return transformedData;
}

// Credits Functions
export async function getUserCredits(userId) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGSQL_ERROR_NOT_FOUND') throw error;
  return data || { points: 0, balance: 0 };
}

export async function getCreditHistory(userId) {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

// Utility Functions
export async function checkTableExists(tableName) {
  try {
    // Try to get a single row from the table with a limit
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    // Check for specific error codes/messages related to table not existing
    if (error) {
      if (error.code === 'PGRST200' || 
          error.message.includes('relation') && error.message.includes('does not exist') ||
          error.message.includes('Cannot find') ||
          error.details?.includes('relation') && error.details?.includes('does not exist')) {
        console.warn(`Table ${tableName} does not exist in the database.`);
        return false;
      }
      // Other errors should be thrown
      throw error;
    }
    
    // If we got here, the table exists
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    // Be cautious - if we can't check, assume it doesn't exist
    return false;
  }
}

// Product Functions
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('title');
    
  if (error) throw error;
  return data;
}

export async function getProductById(productId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteProduct(productId, password) {
  // Similar to other delete functions, using password protection
  const { data, error } = await supabase.rpc('delete_with_password', {
    p_table: 'products',
    p_id: productId,
    p_password: password
  });
  
  if (error) throw error;
  return data;
}

// Order Functions
export async function getOrders(filters = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      customers(*),
      items:order_items(
        *,
        product:products(*)
      )
    `);
  
  // Apply filters if provided
  if (filters.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  // Sort by newest first
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers(*),
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', orderId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createOrder(orderData, orderItems) {
  try {
    // Create the order
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    // Create order items
    if (orderItems.length > 0) {
      const formattedItems = orderItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(formattedItems);
        
      if (itemsError) throw itemsError;
    }
    
    // Return the full order
    return getOrderById(orderResult.id);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteOrder(orderId, password) {
  // Similar to other delete functions, using password protection
  const { data, error } = await supabase.rpc('delete_with_password', {
    p_table: 'orders',
    p_id: orderId,
    p_password: password
  });
  
  if (error) throw error;
  return data;
} 