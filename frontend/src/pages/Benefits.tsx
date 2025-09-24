import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import SharedNavigation from '../components/SharedNavigation';
import { Zap, DollarSign, TrendingUp, Users, Globe, Shield, Award, ArrowRight, CheckCircle, Wallet, Play } from 'lucide-react';

const Benefits: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <SharedNavigation />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="hero-title mb-6">
              Benefits of SunYield
            </h1>
            <p className="hero-subtitle mb-8">
              Discover why thousands of investors choose SunYield for their clean energy investments
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

      {/* CTA Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22stars%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%220.5%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23stars)%22/%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-5xl font-black text-white mb-6">
              Ready to Grow Your{' '}
              <span className="text-yellow-300">Wealth?</span>
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of savvy investors who are already earning impressive returns while supporting India's clean energy transformation
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleRegister}
                className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 group"
              >
                <span>Start Investing Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 group"
              >
                <span>Explore Projects</span>
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Secure Investment</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Guaranteed Returns</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-green-400 mr-2" />
                <span className="text-xl font-bold">SunYield</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing solar investment opportunities for everyone. We're building India's largest community of renewable energy investors, making sustainable wealth creation accessible to all.
              </p>
            </div>
            
            {isAuthenticated ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={() => navigate('/app/projects')} className="hover:text-white transition-colors">Projects</button></li>
                    <li><button onClick={() => navigate('/app/dashboard')} className="hover:text-white transition-colors">Dashboard</button></li>
                    <li><button onClick={() => navigate('/app/earnings')} className="hover:text-white transition-colors">Earnings</button></li>
                    <li><button onClick={() => navigate('/app/wallet')} className="hover:text-white transition-colors">Wallet</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={() => navigate('/app/profile')} className="hover:text-white transition-colors">Profile</button></li>
                    <li><button onClick={() => navigate('/app/subscriptions')} className="hover:text-white transition-colors">Subscriptions</button></li>
                    <li><button onClick={() => navigate('/app/engagement')} className="hover:text-white transition-colors">Engagement</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Help Center</li>
                    <li>Contact Support</li>
                    <li>FAQ</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')} className="hover:text-white transition-colors">Projects</button></li>
                    <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                    <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                    <li><button onClick={() => navigate('/benefits')} className="hover:text-white transition-colors">Benefits</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Get Started</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={handleLogin} className="hover:text-white transition-colors font-semibold">Login</button></li>
                    <li><button onClick={handleRegister} className="hover:text-white transition-colors">Register</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Terms of Service</li>
                    <li>Privacy Policy</li>
                    <li>Exit Policy</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SunYield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Benefits; 