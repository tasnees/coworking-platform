import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">OmniSpace</div>
            <div className="flex items-center space-x-4">
              <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">Beta</span>
              <span className="text-sm">Last Login</span>
              <a 
                href="https://coworking-platform.onrender.com/auth/login" 
                className="text-sm font-medium hover:underline"
              >
                Sign In
              </a>
              <Link 
                href="/auth/register" 
                className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Future of
            <span className="block text-blue-200 mt-2">Coworking Management</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Streamline your coworking space with our comprehensive platform. From smart bookings to AI-powered insights, manage everything in one place while delivering an exceptional member experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/auth/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium text-lg hover:bg-gray-100"
            >
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-white/10">
              Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Everything You Need to Manage Your Space
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Our platform combines essential coworking management tools with cutting-edge technology to help you operate more efficiently.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Member Management',
                description: 'Comprehensive member profiles, role-based access, and subscription management'
              },
              {
                title: 'Smart Booking System',
                description: 'Real-time availability, calendar integration, and automated scheduling'
              },
              {
                title: 'QR Check-in',
                description: 'Contactless entry system with attendance tracking and analytics'
              },
              {
                title: 'Analytics Dashboard',
                description: 'Occupancy insights, revenue tracking, and performance metrics'
              },
              {
                title: 'Mobile Ready',
                description: 'Responsive design optimized for all devices and screen sizes'
              },
              {
                title: 'Real-time Updates',
                description: 'Live booking status, instant notifications, and dynamic pricing'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Choose the plan that fits your coworking space. All plans include our core features with no hidden fees.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49/month',
                description: 'Perfect for small coworking spaces',
                features: [
                  'Up to 50 members',
                  'Basic booking system',
                  'QR check-in',
                  'Email support',
                  'Mobile app access'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Professional',
                price: '$99/month',
                description: 'Ideal for growing coworking businesses',
                features: [
                  'Up to 200 members',
                  'Advanced analytics',
                  'Payment integration',
                  'Priority support',
                  'Custom branding',
                  'API access'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large coworking networks',
                features: [
                  'Unlimited members',
                  'Multi-location support',
                  'Advanced integrations',
                  'Dedicated support',
                  'Custom features',
                  'SLA guarantee'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
                  plan.popular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wide text-center py-1">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-4">{plan.price}</div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-3 rounded-md font-medium ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Coworking Space?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join hundreds of coworking spaces already using OmniSpace to streamline their operations and delight their members.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium text-lg hover:bg-gray-100">
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">OmniSpace</h3>
              <p className="text-gray-400">
                The complete coworking management platform for the modern workspace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'API', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {['Help Center', 'Documentation', 'Status', 'Privacy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            © 2024 OmniSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
