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
      
      // If customer has no membership, allow direct upgrade to any plan
      if (!currentPlanType || currentPlanType === 'None') {
        // Proceed with upgrade to any plan
      } 
      // For existing members, validate upgrade path
      else if (newPlanType === 'Silver Plus' && currentPlanType !== 'Silver') {
        setError('You can only upgrade to Silver Plus from Silver plan.');
        setUpgrading(false);
        return;
      }
      else if (newPlanType === 'Gold' && !['Silver', 'Silver Plus'].includes(currentPlanType)) {
        setError('You can only upgrade to Gold from Silver or Silver Plus plan.');
        setUpgrading(false);
        return;
      }
      
      if (newPlanType === currentPlanType) {
        setError(`Customer is already on the ${currentPlanType} plan.`);
        setUpgrading(false);
        return;
      }
      
      // Make sure we're not downgrading for existing memberships
      if (currentPlanType && currentPlanType !== 'None') {
        const planHierarchy = { 'Silver': 1, 'Silver Plus': 2, 'Gold': 3 };
        if (planHierarchy[newPlanType] < planHierarchy[currentPlanType]) {
          setError('Plan downgrades are not allowed. You can only upgrade to higher plans.');
          setUpgrading(false);
          return;
        }
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
  const isNonMembership = currentPlanType?.includes('Non-Membership');
  const hasNoMembership = !currentPlanType || currentPlanType === 'None';

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
      
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-300 mb-4">
        <p className="font-medium">Important Note</p>
        <p className="text-sm">Plan upgrades only support Silver to Silver Plus to Gold migration path. Once upgraded, only remaining points will be carried forward. Upgrades are non-reversible. Not applicable to Non-Membership plans.</p>
      </div>
      
      {isNonMembership ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-300 mb-4">
          <p className="font-medium">Not Applicable to Non-Membership Plan</p>
          <p className="text-sm">Plan upgrades are only available for membership plans (Silver, Silver Plus, Gold).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Silver Plan Card */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all ${currentPlanType === 'Silver' ? 'ring-2 ring-purple-500' : 'opacity-60'}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Silver</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹2,000</span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/year</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Basic benefits for casual salon-goers
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      30% discount on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      250 points monthly bonus (₹3,000/year)
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      Up to 3 members allowed
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                {currentPlanType === 'Silver' ? (
                  <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-xs font-medium">
                    Current Plan
                  </div>
                ) : hasNoMembership ? (
                  <button 
                    onClick={() => handleUpgrade('Silver')}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgrading ? 'Upgrading...' : 'Select Silver Plan'}
                  </button>
                ) : (
                  <button 
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    disabled
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
            
            {/* Silver Plus Plan Card */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all ${currentPlanType === 'Silver Plus' ? 'ring-2 ring-purple-500' : ''}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Silver Plus</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹3,500</span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/year</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Enhanced benefits for regular clients
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">38% discount</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">₹7,500 initial credit</span> + ₹500/month
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Priority booking</span> + up to 5 members
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                {currentPlanType === 'Silver Plus' ? (
                  <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-xs font-medium">
                    Current Plan
                  </div>
                ) : currentPlanType === 'Silver' ? (
                  <button 
                    onClick={() => handleUpgrade('Silver Plus')}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to Silver Plus'}
                  </button>
                ) : hasNoMembership ? (
                  <button 
                    onClick={() => handleUpgrade('Silver Plus')}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgrading ? 'Upgrading...' : 'Select Silver Plus Plan'}
                  </button>
                ) : (
                  <button 
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    disabled
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
            
            {/* Gold Plan Card */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all ${currentPlanType === 'Gold' ? 'ring-2 ring-purple-500' : ''}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gold</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹5,000</span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/year</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Premium benefits for VIP clients
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">50% discount</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">₹12,500 initial credit</span> + ₹1,000/month
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Complimentary services</span> + unlimited members
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                {currentPlanType === 'Gold' ? (
                  <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-xs font-medium">
                    Current Plan
                  </div>
                ) : ['Silver', 'Silver Plus'].includes(currentPlanType) ? (
                  <button 
                    onClick={() => handleUpgrade('Gold')}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgrading ? 'Upgrading...' : `Upgrade to Gold`}
                  </button>
                ) : hasNoMembership ? (
                  <button 
                    onClick={() => handleUpgrade('Gold')}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgrading ? 'Upgrading...' : 'Select Gold Plan'}
                  </button>
                ) : (
                  <button 
                    className="w-full mt-4 py-2 px-3 rounded-md text-sm font-medium text-white bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    disabled
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Non-Membership Plans */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Non-Membership Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 10k Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Non-Membership</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹10,000</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">• 30% discount</p>
                <p className="text-gray-600 dark:text-gray-300">• ₹13,000 credit</p>
                <p className="text-gray-600 dark:text-gray-300">• Valid for 6 months</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => handleUpgrade('Non-Membership-10k')}
                disabled={upgrading || isNonMembership}
                className="w-full py-2 px-3 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
          
          {/* 20k Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Non-Membership</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹20,000</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">• 38% discount</p>
                <p className="text-gray-600 dark:text-gray-300">• ₹27,600 credit</p>
                <p className="text-gray-600 dark:text-gray-300">• Valid for 6 months</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => handleUpgrade('Non-Membership-20k')}
                disabled={upgrading || isNonMembership}
                className="w-full py-2 px-3 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
          
          {/* 30k Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-teal-200 dark:border-teal-800">
            <div className="absolute right-0 top-0">
              <div className="bg-teal-500 text-white text-xs px-2 py-1 font-bold rounded-bl-lg">NEW</div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Non-Membership</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹30,000</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">• 35% discount</p>
                <p className="text-gray-600 dark:text-gray-300">• ₹40,500 credit</p>
                <p className="text-gray-600 dark:text-gray-300">• Valid for 6 months</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => handleUpgrade('Non-Membership-30k')}
                disabled={upgrading || isNonMembership}
                className="w-full py-2 px-3 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
          
          {/* 50k Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-teal-200 dark:border-teal-800">
            <div className="absolute right-0 top-0">
              <div className="bg-teal-500 text-white text-xs px-2 py-1 font-bold rounded-bl-lg">NEW</div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Non-Membership</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹50,000</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">• 50% discount</p>
                <p className="text-gray-600 dark:text-gray-300">• ₹75,000 credit</p>
                <p className="text-gray-600 dark:text-gray-300">• Valid for 6 months</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => handleUpgrade('Non-Membership-50k')}
                disabled={upgrading || isNonMembership}
                className="w-full py-2 px-3 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 