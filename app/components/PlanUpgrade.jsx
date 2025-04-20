'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { migratePlan } from '../../lib/db';

export default function PlanUpgrade({ customerId }) {
  const supabase = createClientComponentClient();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch customer with membership details
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          memberships(
            id,
            membership_type,
            points_balance,
            start_date,
            active
          )
        `)
        .eq('id', customerId)
        .single();
        
      if (error) throw error;
      
      setCustomer(data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newPlanType) => {
    if (!customer) {
      setError('No customer selected for upgrade.');
      return;
    }

    try {
      setUpgrading(true);
      setError(null);
      setSuccess(null);
      
      // Get current active membership
      const activeMembership = customer.memberships?.find(m => m.active);
      const currentPlanType = activeMembership?.membership_type || customer.membership_type;
      
      // Validate upgrade path
      if (newPlanType === 'Silver Plus' && currentPlanType !== 'Silver') {
        setError('You can only upgrade to Silver Plus from Silver plan.');
        setUpgrading(false);
        return;
      }
      
      if (newPlanType === 'Gold' && !['Silver', 'Silver Plus'].includes(currentPlanType)) {
        setError('You can only upgrade to Gold from Silver or Silver Plus plan.');
        setUpgrading(false);
        return;
      }
      
      if (newPlanType === currentPlanType) {
        setError(`Customer is already on the ${currentPlanType} plan.`);
        setUpgrading(false);
        return;
      }
      
      // Make sure we're not downgrading
      const planHierarchy = { 'Silver': 1, 'Silver Plus': 2, 'Gold': 3 };
      if (planHierarchy[newPlanType] < planHierarchy[currentPlanType]) {
        setError('Plan downgrades are not allowed. You can only upgrade to higher plans.');
        setUpgrading(false);
        return;
      }
      
      // Call the migratePlan function from lib/db.js
      const result = await migratePlan(customerId, newPlanType);
      
      if (result.success) {
        setSuccess(result.message);
        // Refresh customer data
        fetchCustomerDetails();
      } else {
        throw new Error(result.message || 'Failed to upgrade plan');
      }
      
    } catch (err) {
      console.error('Error upgrading plan:', err);
      setError('Failed to upgrade plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-300">
        Please select a customer to manage plan upgrades.
      </div>
    );
  }

  const activeMembership = customer?.memberships?.find(m => m.active);
  const currentPlanType = activeMembership?.membership_type || customer?.membership_type;
  const currentPoints = activeMembership?.points_balance || 0;
  
  // Check if non-membership to prevent upgrades
  const isNonMembership = currentPlanType?.includes('Non-Membership') || currentPlanType === 'None';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Plan Migration</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Customer:</span> {customer?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Current Plan:</span> {currentPlanType || 'None'}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Current Points:</span> {currentPoints.toLocaleString()}
        </p>
      </div>
      
      {isNonMembership ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-300 mb-4">
          <p className="font-medium">Not Applicable to Non-Membership Plan</p>
          <p className="text-sm">Plan upgrades are only available for membership plans (Silver, Silver Plus, Gold).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Note: Once upgraded, only remaining points will be carried forward. Upgrades are non-reversible.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlanType === 'Silver' && (
              <button
                onClick={() => handleUpgrade('Silver Plus')}
                disabled={upgrading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Upgrading...' : 'Upgrade to Silver Plus'}
              </button>
            )}
            
            {(currentPlanType === 'Silver' || currentPlanType === 'Silver Plus') && (
              <button
                onClick={() => handleUpgrade('Gold')}
                disabled={upgrading}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Upgrading...' : 'Upgrade to Gold'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 