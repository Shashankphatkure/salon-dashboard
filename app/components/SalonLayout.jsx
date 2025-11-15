import Link from 'next/link';
import Navbar from './Navbar';

const SalonLayout = ({ children, currentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      {/* Use shared Navbar component */}
      <Navbar />

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default SalonLayout; 