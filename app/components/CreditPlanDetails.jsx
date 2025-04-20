'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const CreditPlanDetails = ({ planType = 'standard', customerData }) => {
  const supabase = createClientComponentClient();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Credit data based on membership plan
  const membershipCreditDetails = {
    gold: {
      name: 'Gold Membership',
      initialCredit: 12500,
      monthlyBonus: 1000,
      maxUsagePerVisit: 70,
      validityMonths: 12
    },
    silverPlus: {
      name: 'Silver Plus Membership',
      initialCredit: 7500,
      monthlyBonus: 500,
      maxUsagePerVisit: 50,
      validityMonths: 12
    },
    silver: {
      name: 'Silver Membership',
      initialCredit: 0,
      monthlyBonus: 250,
      maxUsagePerVisit: 30,
      validityMonths: 12
    },
    standard: {
      name: 'Standard Credit',
      initialCredit: 0,
      monthlyBonus: 0,
      maxUsagePerVisit: 20,
      validityMonths: 6
    }
  };

  // Fetch transactions for the customer
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!customerData) return;
      
      try {
        setIsLoading(true);
        
        // Fetch transactions from Supabase
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setTransactions(data || []);
        
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [customerData]);

  // Calculate credit details based on membership and transactions
  const calculateCreditDetails = () => {
    const planDetails = membershipCreditDetails[planType] || membershipCreditDetails.standard;
    
    // If no customer data, return default values
    if (!customerData) {
      return {
        ...planDetails,
        totalAmount: planDetails.initialCredit,
        paidAmount: 0,
        bonusAmount: planDetails.initialCredit,
        remainingCredit: planDetails.initialCredit,
        usedCredit: 0,
        validUntil: new Date(Date.now() + planDetails.validityMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }
    
    // Membership start date or fallback to join date
    const startDate = customerData.memberships && customerData.memberships[0]?.start_date 
      ? new Date(customerData.memberships[0].start_date) 
      : new Date(customerData.join_date);
    
    // Calculate validity end date
    const validUntil = new Date(startDate);
    validUntil.setMonth(validUntil.getMonth() + planDetails.validityMonths);
    
    // Calculate months since membership started
    const today = new Date();
    const monthsSinceMembership = 
      (today.getFullYear() - startDate.getFullYear()) * 12 + 
      (today.getMonth() - startDate.getMonth());
    
    // Calculate total bonus points earned over time (capped at membership validity)
    const monthlyBonusEarned = Math.min(
      monthsSinceMembership, 
      planDetails.validityMonths
    ) * planDetails.monthlyBonus;
    
    // Initial credit + monthly bonuses
    const totalCreditEarned = planDetails.initialCredit + monthlyBonusEarned;
    
    // Calculate used credit from transactions
    const usedCredit = transactions.reduce((total, transaction) => 
      total + (transaction.credit_used || 0), 0);
    
    // Remaining credit
    const remainingCredit = Math.max(0, totalCreditEarned - usedCredit);
    
    return {
      ...planDetails,
      totalAmount: totalCreditEarned,
      paidAmount: customerData.membership_fee || 0,
      bonusAmount: planDetails.initialCredit,
      remainingCredit: remainingCredit,
      usedCredit: usedCredit,
      validUntil: validUntil.toISOString().split('T')[0],
      transactions: transactions.map(tx => ({
        id: tx.id,
        date: tx.date,
        service: tx.service_name || 'Salon Service',
        amount: tx.amount || 0,
        creditUsed: tx.credit_used || 0,
        amountPaid: (tx.amount || 0) - (tx.credit_used || 0)
      }))
    };
  };

  const planData = calculateCreditDetails();
  
  // Calculate days remaining
  const validDate = new Date(planData.validUntil);
  const today = new Date();
  const daysRemaining = Math.ceil((validDate - today) / (1000 * 60 * 60 * 24));
  
  // Calculate percentage used
  const percentUsed = planData.totalAmount > 0 
    ? Math.round((planData.usedCredit / planData.totalAmount) * 100) 
    : 0;

  return (
    <div className="space-y-8 py-6">
      {/* Credit Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400">{planData.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Valid until {new Date(planData.validUntil).toLocaleDateString()} ({daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center min-w-[120px]">
              <p className="text-sm text-gray-500 dark:text-gray-400">Credit Balance</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                ₹{planData.remainingCredit.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center min-w-[120px]">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                ₹{planData.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Credit Usage</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{percentUsed}% used</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-500 rounded-full" 
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Membership Fee</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">₹{planData.paidAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Initial Credit</p>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">+₹{planData.bonusAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Bonus</p>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">+₹{planData.monthlyBonus.toLocaleString()}/month</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Used Credit</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">₹{planData.usedCredit.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Max Usage Per Visit</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {planData.maxUsagePerVisit}% (₹{Math.round(planData.remainingCredit * (planData.maxUsagePerVisit/100)).toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-teal-50 dark:bg-teal-900/30 border-b border-teal-100 dark:border-teal-900/50">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Transaction History</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : planData.transactions && planData.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credit Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cash Paid</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {planData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                        {transaction.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 dark:text-teal-400 font-medium">
                        ₹{transaction.creditUsed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₹{transaction.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions yet. {customerData?.name || 'Customer'}'s credit is ready to be used.
            </div>
          )}
        </div>
      </div>

      {/* Calculation Example */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          How Your Credit Works
        </h3>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            With {customerData ? customerData.name + "'s" : "your"} {planData.name} plan, 
            {planData.totalAmount > 0 ? (
              <>
                {' '}the total credit value is <span className="font-semibold">₹{planData.totalAmount.toLocaleString()}</span>, 
                of which <span className="font-semibold">₹{planData.remainingCredit.toLocaleString()}</span> is remaining.
              </>
            ) : (
              ' no initial credit is provided, but monthly bonuses accumulate over time.'
            )}
          </p>
          <p>
            For each visit, up to <span className="font-semibold">{planData.maxUsagePerVisit}%</span> of the total credit 
            can be used (currently <span className="font-semibold">₹{Math.round(planData.remainingCredit * (planData.maxUsagePerVisit/100)).toLocaleString()}</span>).
          </p>
          <p>
            For example, if a service costs ₹{Math.round(planData.remainingCredit * (planData.maxUsagePerVisit/100) * 0.8).toLocaleString()}, 
            credit can be used and no additional payment is needed. For more expensive services, the difference would be paid in cash.
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
            This credit is valid until {new Date(planData.validUntil).toLocaleDateString()} 
            - {daysRemaining > 0 ? 'make sure to use it before it expires!' : 'it has expired.'}
          </p>
          {planType !== 'standard' && (
            <p className="mt-4 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
              <span className="font-semibold">Membership benefit:</span> Receive ₹{planData.monthlyBonus.toLocaleString()} in bonus credit every month.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditPlanDetails; 