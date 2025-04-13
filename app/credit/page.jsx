import CreditPlanDetails from '../components/CreditPlanDetails';
import SalonLayout from '../components/SalonLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Credit Plan - Shashank\'s Salon',
  description: 'View your salon credit details and transactions.',
};

export default function CreditPlan() {
  return (
    <SalonLayout currentPage="credit">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Credit Plan</h2>
            <p className="text-gray-600 dark:text-gray-300">
              View your non-membership credit details, transactions, and usage limits.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/">
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                Upgrade Your Plan
              </button>
            </Link>
          </div>
        </div>

        <CreditPlanDetails planType="standard" />
      </div>
    </SalonLayout>
  );
} 