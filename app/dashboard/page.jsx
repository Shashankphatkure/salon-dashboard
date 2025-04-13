import MemberDashboard from '../components/MemberDashboard';
import SalonLayout from '../components/SalonLayout';

export const metadata = {
  title: 'Dashboard - Shashank\'s Salon',
  description: 'View your salon membership details, transactions, and rewards.',
};

export default function Dashboard() {
  return (
    <SalonLayout currentPage="dashboard">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Member Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View your membership details, transactions, and rewards.
          </p>
        </div>

        <MemberDashboard activePlan="gold" />
      </div>
    </SalonLayout>
  );
} 