import Link from 'next/link';

const SalonLayout = ({ children, currentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-300">Shashank's Salon</h1>
        <nav className="flex gap-6">
          <Link 
            href="/" 
            className={`font-medium ${currentPage === 'home' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Home
          </Link>
          <Link 
            href="/dashboard" 
            className={`font-medium ${currentPage === 'dashboard' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/membership" 
            className={`font-medium ${currentPage === 'membership' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Membership
          </Link>
          <Link 
            href="/customers" 
            className={`font-medium ${currentPage === 'customers' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Customers
          </Link>
          <Link 
            href="/credit" 
            className={`font-medium ${currentPage === 'credit' ? 'text-teal-600 dark:text-teal-300' : 'hover:text-teal-600 dark:hover:text-teal-300'}`}
          >
            Credit
          </Link>
          <Link 
            href="/services" 
            className={`font-medium ${currentPage === 'services' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Services
          </Link>
          <Link 
            href="/staff" 
            className={`font-medium ${currentPage === 'staff' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Staff
          </Link>
          <Link 
            href="/reports" 
            className={`font-medium ${currentPage === 'reports' ? 'text-purple-600 dark:text-purple-300' : 'hover:text-purple-600 dark:hover:text-purple-300'}`}
          >
            Reports
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-20 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Shashank's Salon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SalonLayout; 