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

// Customer Functions
export async function getCustomers(userId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('owner_id', userId)
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
  const slots = timeSlots.map(slot => ({
    staff_id: staffId,
    date,
    start_time: slot.start,
    end_time: slot.end,
    is_available: slot.available
  }));
  
  const { data, error } = await supabase
    .from('staff_availability')
    .insert(slots)
    .select();
    
  if (error) throw error;
  return data;
}

// Appointment Functions
export async function createAppointment(appointment) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select(`
      *,
      customer:customers(*),
      staff:staff(*),
      services:appointment_services(
        service:services(*)
      )
    `)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getAppointments(filters = {}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*),
      staff:staff(*),
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
  const { data, error } = await supabase.rpc('get_sales_report', {
    p_start_date: startDate,
    p_end_date: endDate
  });
  
  if (error) throw error;
  return data;
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