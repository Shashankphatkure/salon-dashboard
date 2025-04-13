const ServicesSection = () => {
  // Sample salon services data
  const services = [
    {
      id: 1,
      category: 'Hair',
      items: [
        { id: 101, name: 'Hair Cut & Style', price: 1500, description: 'Precision haircut and styling by our experts' },
        { id: 102, name: 'Hair Color', price: 4000, description: 'Professional hair coloring with premium products' },
        { id: 103, name: 'Hair Treatment', price: 3000, description: 'Rejuvenating treatments for damaged hair' },
        { id: 104, name: 'Blowdry & Styling', price: 1000, description: 'Professional styling for any occasion' },
      ]
    },
    {
      id: 2, 
      category: 'Face',
      items: [
        { id: 201, name: 'Facial', price: 2500, description: 'Deep cleansing facial with premium products' },
        { id: 202, name: 'Clean-up', price: 1200, description: 'Quick facial clean-up for refreshed skin' },
        { id: 203, name: 'Threading', price: 300, description: 'Precise threading for perfectly shaped brows' },
      ]
    },
    {
      id: 3,
      category: 'Body',
      items: [
        { id: 301, name: 'Full Body Massage', price: 5000, description: '60-minute relaxing massage therapy' },
        { id: 302, name: 'Manicure', price: 1200, description: 'Luxurious nail care for beautiful hands' },
        { id: 303, name: 'Pedicure', price: 1500, description: 'Rejuvenating foot care treatment' },
        { id: 304, name: 'Waxing', price: 2000, description: 'Full body waxing with gentle products' },
      ]
    },
    {
      id: 4,
      category: 'Bridal',
      items: [
        { id: 401, name: 'Bridal Package', price: 25000, description: 'Complete bridal beauty preparation' },
        { id: 402, name: 'Pre-Wedding Package', price: 15000, description: 'Series of treatments before the big day' },
      ]
    }
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Services</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore our wide range of premium salon services. Members receive additional benefits and rewards.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-purple-100 dark:bg-purple-900/30 border-b border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">{category.category}</h3>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {category.items.map((service) => (
                <div key={service.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white">{service.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">₹{service.price}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(service.price * 0.8)} - {Math.round(service.price * 0.5)} for members
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-block bg-purple-100 dark:bg-purple-900/20 rounded-lg px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
          <p className="font-medium text-purple-700 dark:text-purple-300 mb-2">Membership Benefits</p>
          <p>Gold Members: <span className="font-medium">Up to 50% off</span> on services</p>
          <p>Silver Plus: <span className="font-medium">Up to 35% off</span> on services</p>
          <p>Silver: <span className="font-medium">Up to 20% off</span> on services</p>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection; 