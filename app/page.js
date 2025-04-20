import Navbar from './components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <Navbar />

      <main className="container mx-auto py-10 px-4">
        {/* Book an Appointment Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="px-8 py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Book An Appointment Today
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Experience luxury salon services with our skilled professionals. Book your appointment now!
            </p>
            
            <Link href="/book-appointment">
              <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-lg shadow-md transition-all transform hover:scale-105">
                Book Now
              </button>
            </Link>
            
            <div className="mt-8 flex flex-wrap justify-center gap-8">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Expert stylists</span>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Premium products</span>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Relaxing environment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Salon Plans & Membership Options
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your salon experience.
          </p>
        </div>

        {/* Non-Membership Plan */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-700 dark:text-white">Non-Membership Plans</h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Basic</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹0</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pay as you go</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Access to all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      No commitment
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <Link href="/book-appointment">
                  <button className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg">
                    Book Now
                  </button>
                </Link>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Premium</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹30,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Premium benefits</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">35% discount</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Priority booking
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Access to exclusive treatments
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <Link href="/membership/select?plan=premium">
                  <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                    Select Plan
                  </button>
                </Link>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Elite</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold">₹50,000</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Our most exclusive plan</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">50% discount</span> on all services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      VIP treatment & priority booking
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Complimentary luxury add-ons
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Exclusive event invitations
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                <Link href="/membership/select?plan=elite">
                  <button className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">
                    Select Plan
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Plans */}
        <h3 className="text-2xl font-bold text-center mb-8 text-gray-700 dark:text-white">Membership Plans</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              <Link href="/dashboard">
                <button className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg">
                  Select Plan
                </button>
              </Link>
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
              <Link href="/dashboard">
                <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                  Select Plan
                </button>
              </Link>
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
              <Link href="/dashboard">
                <button className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">
                  Select Plan
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Link href="/book-appointment">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-lg shadow-md transition-colors duration-300">
              Book an Appointment Now
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4">Shashank's Salon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Premium salon services with exclusive membership benefits.
              </p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Services</Link></li>
                <li><Link href="/membership" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Membership</Link></li>
                <li><Link href="/book-appointment" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Book Appointment</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Contact Us</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-2">123 Salon Street, Beauty City</p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Phone: +91 98765 43210</p>
              <p className="text-gray-600 dark:text-gray-400">Email: info@shashankssalon.com</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Shashank's Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
