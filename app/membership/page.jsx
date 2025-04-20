'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SalonLayout from '../components/SalonLayout';
import PlanUpgrade from '../components/PlanUpgrade';

// Create a component that uses useSearchParams
function MembershipContent() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanUpgrade, setShowPlanUpgrade] = useState(false);
  
  // Fetch customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, membership_type');
          
        if (error) throw error;
        
        setCustomers(data.map(customer => ({
          id: customer.id,
          name: customer.name,
          membershipType: customer.membership_type
        })));
        
      } catch (error) {
        console.error('Error fetching customers:', error);
        alert('Error loading customers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const handleSelectPlan = async (planType) => {
    if (!selectedCustomer) {
      alert('Please select a customer first to assign membership');
      return;
    }
    
    try {
      // Update customer membership in Supabase
      const { error } = await supabase
        .from('customers')
        .update({ 
          membership_type: planType,
          updated_at: new Date()
        })
        .eq('id', selectedCustomer);
        
      if (error) throw error;
      
      // Also add a record to memberships table for history
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          customer_id: selectedCustomer,
          membership_type: planType,
          start_date: new Date(),
          active: true
        });
      
      if (membershipError) {
        console.error('Error adding membership history:', membershipError);
        // Don't stop the flow if this fails
      }
      
      alert(`Assigned ${planType} membership to customer ID: ${selectedCustomer}`);
      
      // Redirect back to customer page
      router.push(`/customers?updatedMembership=${selectedCustomer}`);
      
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Error updating membership. Please try again.');
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Membership Plans</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose the perfect membership plan for exclusive benefits, discounts, and rewards.
            </p>
            
            {/* Customer Selection */}
            <div className="mt-6 max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign Membership to Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.membershipType !== 'None' ? `(Current: ${customer.membershipType})` : '(No membership)'}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Select a customer before choosing a membership plan below
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setShowPlanUpgrade(!showPlanUpgrade)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md font-medium flex items-center gap-2"
              >
                {showPlanUpgrade ? 'Hide' : 'Show'} Plan Migration Options
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Plan Upgrade section */}
          {showPlanUpgrade && (
            <PlanUpgrade customerId={selectedCustomer} />
          )}

          {/* Membership Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Non-Membership Plans first */}
            {/* 30,000 Non-Membership Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Non-Membership</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹30,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">One-time payment with premium benefits</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">35% off</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">No</span> monthly commitment
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Credit balance</span> of ₹30,000
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg"
                  onClick={() => handleSelectPlan('Non-Membership-30k')}
                >
                  Select Plan
                </button>
              </div>
            </div>

            {/* 50,000 Non-Membership Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Non-Membership</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹50,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">One-time payment with premium benefits</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">50% off</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">No</span> monthly commitment
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Credit balance</span> of ₹50,000
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg"
                  onClick={() => handleSelectPlan('Non-Membership-50k')}
                >
                  Select Plan
                </button>
              </div>
            </div>

            {/* Silver Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Silver</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹2,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Basic benefits for casual salon-goers</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">20% off</span> on first service
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">250 points</span> monthly bonus (₹3,000/year)
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Up to <span className="font-medium">3 members</span> allowed
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg"
                  onClick={() => handleSelectPlan('Silver')}
                >
                  Select Plan
                </button>
              </div>
            </div>

            {/* Silver Plus Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-purple-400 transform transition-transform hover:scale-105 relative">
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                Popular
              </div>
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">Silver Plus</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹4,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enhanced benefits for regular customers</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">35% off</span> on first service
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">500 points</span> monthly bonus (₹6,000/year)
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">7,500 points</span> added to account on signup
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Up to <span className="font-medium">5 members</span> allowed
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                  onClick={() => handleSelectPlan('Silver Plus')}
                >
                  Select Plan
                </button>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">Gold</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹8,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Premium benefits for loyal customers</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">50% off</span> on first service
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">₹12,500</span> credit on signup
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">1,000 points</span> monthly bonus (₹12,000/year)
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Unlimited members</span> allowed
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">500 bonus points</span> for each referral
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-gray-700 text-center">
                <button
                  className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg"
                  onClick={() => handleSelectPlan('Gold')}
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">How Membership Works</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Monthly Bonus Points</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Each month, bonus points are automatically added to your account based on your membership level.
                  These points can be redeemed for services at our salon.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Member Limits</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Gold members can share benefits with unlimited family and friends. Silver Plus members can add up to 5 members,
                  while Silver members can add up to 3 members to their plan.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Example Savings</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  With a Gold membership, if you have 3,000 points accumulated over 3 months and take a ₹5,000 service,
                  you'll use your points and only pay ₹2,000 in cash - that's a significant discount!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function MembershipPlans() {
  return (
    <SalonLayout currentPage="membership">
      <div className="container mx-auto py-10 px-4">
        <Suspense fallback={
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }>
          <MembershipContent />
        </Suspense>
      </div>
    </SalonLayout>
  );
} 