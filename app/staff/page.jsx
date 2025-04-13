import SalonLayout from '../components/SalonLayout';

export const metadata = {
  title: 'Staff - Shashank\'s Salon',
  description: 'Meet our talented team of stylists and beauticians.',
};

export default function StaffPage() {
  return (
    <SalonLayout currentPage="staff">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Our Staff</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Meet our talented team of stylists and beauticians.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Staff Member 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">👩‍💇‍♀️</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Priya Sharma</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Senior Hair Stylist</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Specializing in precision cuts, coloring, and styling for all hair types. 8+ years of experience with international training.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mon-Wed: 10am-6pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fri-Sat: 10am-8pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Member 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">💇‍♂️</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Rahul Kapoor</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Hair Stylist & Colorist</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Expert in modern color techniques and trendy styles. Known for creating unique looks tailored to individual preferences.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tue-Fri: 11am-7pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sat: 9am-5pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Member 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">💅</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ananya Patel</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Nail Artist & Therapist</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Creative nail technician specializing in gel extensions, nail art, and therapeutic treatments for hands and feet.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mon-Wed: 9am-5pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Thu-Sat: 12pm-8pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Member 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">✨</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Neha Gupta</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Makeup Artist</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Professional makeup artist with expertise in bridal, event, and everyday makeup. Skilled in working with all skin tones.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wed-Fri: 10am-6pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sat-Sun: 9am-7pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Member 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">💆‍♀️</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Amit Sharma</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Spa Therapist</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Certified therapist specializing in relaxation and therapeutic massages, facials, and body treatments.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mon, Thu, Fri: 11am-7pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sat-Sun: 10am-6pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Member 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">👨‍💼</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Kunal Verma</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Salon Manager</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Oversees daily operations and ensures exceptional customer experiences. Ask Kunal about membership plans and special promotions.
              </p>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AVAILABILITY</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mon-Fri: 9am-6pm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule a Consultation */}
        <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Book a Consultation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Not sure which stylist is right for your needs? Schedule a free 15-minute consultation
              to discuss your preferences and get matched with the perfect professional.
            </p>
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    </SalonLayout>
  );
} 