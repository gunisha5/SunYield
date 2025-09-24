import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import SharedNavigation from '../components/SharedNavigation';
import { Zap, Search, CreditCard, TrendingUp, Users, Globe, Shield, ArrowRight, CheckCircle, Sun, Battery, DollarSign, Wallet, Play } from 'lucide-react';

const HowItWorks: React.FC = () => {
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
              How SunYield Works
            </h1>
            <p className="hero-subtitle mb-8">
              Your complete guide to investing in solar energy projects and earning sustainable returns
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to earning returns, we've made solar investment as simple as possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Explore Projects</h3>
              <p className="text-gray-600 mb-6">
                Browse our curated selection of solar projects. Each project is thoroughly vetted and includes detailed information about location, capacity, and expected returns.
              </p>
              <div className="flex items-center justify-center text-green-600 font-semibold">
                <span>Browse Projects</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Invest Securely</h3>
              <p className="text-gray-600 mb-6">
                Choose your investment amount and complete the transaction through our secure payment system. Start with as little as $100.
              </p>
              <div className="flex items-center justify-center text-blue-600 font-semibold">
                <span>Secure Payment</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sun className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Solar Generation</h3>
              <p className="text-gray-600 mb-6">
                Your investment goes directly to solar panel installation and maintenance. The panels generate clean electricity and revenue from energy sales.
              </p>
              <div className="flex items-center justify-center text-purple-600 font-semibold">
                <span>Clean Energy</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="card text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Earn Returns</h3>
              <p className="text-gray-600 mb-6">
                Receive regular payments based on energy production and sales. Track your earnings in real-time through our dashboard.
              </p>
              <div className="flex items-center justify-center text-orange-600 font-semibold">
                <span>Track Earnings</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Complete Investment Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From project selection to ongoing returns, here's everything you need to know
            </p>
          </div>

          <div className="space-y-12">
            {/* Project Selection */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Selection & Due Diligence</h3>
                  <p className="text-gray-600 mb-4">
                    Our team of experts carefully selects solar projects based on multiple criteria including location, solar irradiance, grid connectivity, and financial viability. Each project undergoes rigorous due diligence to ensure maximum returns and minimal risk.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Location analysis and solar resource assessment
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Financial modeling and return projections
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Technical feasibility and grid integration
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Regulatory compliance and permitting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Investment Process */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment & Ownership</h3>
                  <p className="text-gray-600 mb-4">
                    When you invest in a solar project, you're purchasing a fractional ownership stake in the actual solar installation. This gives you direct ownership of the energy production and revenue generated by your portion of the solar array.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Fractional ownership of solar assets
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Secure blockchain-based ownership records
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Transparent investment tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Flexible investment amounts starting at $100
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Energy Production */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-purple-100 p-4 rounded-xl">
                  <Battery className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Energy Production & Sales</h3>
                  <p className="text-gray-600 mb-4">
                    Your solar panels generate clean electricity that's sold to the grid or directly to consumers. Revenue comes from power purchase agreements, energy sales, and government incentives for renewable energy production.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Real-time energy production monitoring
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Grid integration and power sales
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Renewable energy credits and incentives
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Automated revenue collection and distribution
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Returns & Monitoring */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-orange-100 p-4 rounded-xl">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Returns & Portfolio Management</h3>
                  <p className="text-gray-600 mb-4">
                    Receive regular payments based on your share of energy production and sales. Our platform provides comprehensive monitoring tools to track performance, earnings, and environmental impact.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Monthly or quarterly dividend payments
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Real-time performance dashboard
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Environmental impact tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Portfolio diversification across multiple projects
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SunYield?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most transparent and accessible solar investment platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Regulated</h3>
              <p className="text-gray-600">
                All investments are backed by real assets and comply with financial regulations. Your ownership is recorded on secure blockchain technology.
              </p>
            </div>

            <div className="card text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Democratized Access</h3>
              <p className="text-gray-600">
                Start investing with just $100. We've removed the barriers that traditionally kept solar investment out of reach for most people.
              </p>
            </div>

            <div className="card text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Environmental Impact</h3>
              <p className="text-gray-600">
                Every investment directly contributes to clean energy production and reduces carbon emissions. Track your environmental impact in real-time.
              </p>
            </div>

            <div className="card text-center">
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Predictable Returns</h3>
              <p className="text-gray-600">
                Solar energy production is highly predictable, providing stable returns over the 25+ year lifespan of solar panels.
              </p>
            </div>

            <div className="card text-center">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Monitor your investments 24/7 with our comprehensive dashboard showing energy production, earnings, and performance metrics.
              </p>
            </div>

            <div className="card text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Revenue Streams</h3>
              <p className="text-gray-600">
                Earn from energy sales, government incentives, renewable energy credits, and carbon offset programs.
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

export default HowItWorks;

