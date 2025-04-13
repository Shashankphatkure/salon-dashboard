'use client';

import { useState } from 'react';

const CreditPlanDetails = ({ planType = 'standard' }) => {
  const [creditData, setCreditData] = useState({
    standard: {
      name: 'Standard Credit',
      totalAmount: 13000,
      paidAmount: 10000,
      bonusAmount: 3000,
      remainingCredit: 10400,
      usedCredit: 2600,
      validUntil: '2024-12-15',
      maxUsagePerVisit: 70,
      transactions: [
        { id: 1, date: '2024-06-30', service: 'Hair Color', amount: 4000, creditUsed: 2600, amountPaid: 1400 }
      ]
    },
    premium: {
      name: 'Premium Credit',
      totalAmount: 26000,
      paidAmount: 20000,
      bonusAmount: 6000,
      remainingCredit: 26000,
      usedCredit: 0,
      validUntil: '2024-12-20',
      maxUsagePerVisit: 30,
      transactions: []
    }
  });

  const planData = creditData[planType] || creditData.standard;
  
  // Calculate days remaining
  const validDate = new Date(planData.validUntil);
  const today = new Date();
  const daysRemaining = Math.ceil((validDate - today) / (1000 * 60 * 60 * 24));
  
  // Calculate percentage used
  const percentUsed = Math.round((planData.usedCredit / planData.totalAmount) * 100);

  return (
    <div className="space-y-8 py-6">
      {/* Credit Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400">{planData.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Valid until {new Date(planData.validUntil).toLocaleDateString()} ({daysRemaining} days remaining)
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">₹{planData.paidAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bonus Credit</p>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">+₹{planData.bonusAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Used Credit</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">₹{planData.usedCredit.toLocaleString()}</p>
            </div>
            <div>
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
          {planData.transactions.length > 0 ? (
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
                        ₹{transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 dark:text-teal-400 font-medium">
                        ₹{transaction.creditUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₹{transaction.amountPaid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions yet. Your credit is ready to be used.
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
            With your {planData.name} plan, you have a total credit value of <span className="font-semibold">₹{planData.totalAmount.toLocaleString()}</span>, 
            of which <span className="font-semibold">₹{planData.remainingCredit.toLocaleString()}</span> is remaining.
          </p>
          <p>
            For each visit, you can use up to <span className="font-semibold">{planData.maxUsagePerVisit}%</span> of your total credit 
            (currently <span className="font-semibold">₹{Math.round(planData.remainingCredit * (planData.maxUsagePerVisit/100)).toLocaleString()}</span>).
          </p>
          <p>
            For example, if you take a service worth ₹{Math.round(planData.remainingCredit * (planData.maxUsagePerVisit/100) * 0.8).toLocaleString()}, 
            you can use your credit and pay nothing additional. If the service costs more, you'll pay the difference in cash.
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
            Your credit is valid until {new Date(planData.validUntil).toLocaleDateString()} - make sure to use it before it expires!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditPlanDetails; 