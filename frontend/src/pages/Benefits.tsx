import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, DollarSign, TrendingUp, Users, Globe, Shield, Award, ArrowRight, CheckCircle } from 'lucide-react';

const Benefits: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Solar Capital Logo */}
            <div className="flex items-center -ml-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors pl-8 group"
                >
                  <Zap className="h-8 w-8 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Solar Capital
                </button>
              </div>
            </div>
            
            {/* Center - Navigation Links */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/benefits')}
                className="text-green-600 font-semibold border-b-2 border-green-600 pb-1 transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Explore Projects
              </button>
            </div>
            
            {/* Right side - Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="btn-primary"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="hero-title mb-6">
              Benefits of Solar Capital
            </h1>
            <p className="hero-subtitle mb-8">
              Discover why thousands of investors choose Solar Capital for their clean energy investments
            </p>
          </div>
        </div>
      </section>

      {/* Financial Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Benefits</h2>
            <p className="text-xl text-gray-600">Earn attractive returns while supporting clean energy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Attractive Returns</h3>
              <p className="text-gray-600 mb-4">
                Earn 12-15% annual returns through Green Credits, directly linked to actual energy production.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Performance-based rewards
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Monthly credit distribution
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  No hidden fees or charges
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Low Investment Threshold</h3>
              <p className="text-gray-600 mb-4">
                Start with as little as ₹1,000. No large capital requirements or complex investment structures.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Minimum ₹1,000 investment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Flexible investment amounts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  No lock-in periods
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Mitigation</h3>
              <p className="text-gray-600 mb-4">
                Diversified across multiple projects and locations, reducing investment risk.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Project diversification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  No asset ownership risk
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Professional management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Environmental Benefits</h2>
            <p className="text-xl text-gray-600">Make a positive impact on the planet while earning returns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Carbon Footprint Reduction</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Globe className="h-6 w-6 text-green-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Clean Energy Generation</h4>
                    <p className="text-gray-600 mt-2">Every kilowatt-hour of solar energy generated reduces carbon emissions by approximately 0.5 kg of CO2.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-blue-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Renewable Energy Support</h4>
                    <p className="text-gray-600 mt-2">Your investment directly supports the expansion of renewable energy infrastructure in India.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Award className="h-6 w-6 text-purple-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Sustainable Development</h4>
                    <p className="text-gray-600 mt-2">Contribute to India's sustainable development goals and clean energy transition.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Annual Energy Production:</span>
                  <span className="font-semibold">~144,000 kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CO2 Reduction:</span>
                  <span className="font-semibold text-green-600">~72 tons/year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Equivalent Trees:</span>
                  <span className="font-semibold text-green-600">~3,600 trees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Homes Powered:</span>
                  <span className="font-semibold">~12 homes</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                *Based on ₹10,000 investment in a 100 kW solar project
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Social Benefits</h2>
            <p className="text-xl text-gray-600">Supporting communities while earning returns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Community Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Your investment helps schools, hospitals, and institutions reduce their energy costs and 
                redirect savings to better serve their communities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Schools can invest more in education</li>
                <li>• Hospitals can improve healthcare services</li>
                <li>• Institutions can expand their programs</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Job Creation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Solar projects create local employment opportunities in installation, maintenance, 
                and monitoring roles.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Local installation jobs</li>
                <li>• Ongoing maintenance work</li>
                <li>• Technical monitoring positions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Convenience Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Convenience Benefits</h2>
            <p className="text-xl text-gray-600">Simple, hassle-free solar investment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rooftop Needed</h3>
              <p className="text-gray-600 text-sm">
                Invest in solar without owning property or dealing with rooftop installations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance</h3>
              <p className="text-gray-600 text-sm">
                We handle all technical aspects, maintenance, and regulatory compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-600 text-sm">
                Track your project's performance and energy production in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Management</h3>
              <p className="text-gray-600 text-sm">
                Professional team manages all aspects of your solar investment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning Benefits?</h2>
          <p className="text-xl mb-8">Join thousands of investors who are already enjoying these advantages</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Explore Projects
            </button>
            <button
              onClick={handleRegister}
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Solar Capital</h3>
              <p className="text-sm">Own solar without a rooftop. Earn Green Credits from real solar projects.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/projects')} className="hover:text-white transition-colors">Projects</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Learn More</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => navigate('/benefits')} className="hover:text-white transition-colors">Benefits</button></li>

              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={handleLogin} className="hover:text-white transition-colors">Login</button></li>
                <li><button onClick={handleRegister} className="hover:text-white transition-colors">Register</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Solar Capital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Benefits; 