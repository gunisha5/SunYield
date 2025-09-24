import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import SharedNavigation from '../components/SharedNavigation';
import { Zap, Target, Users, Globe, Award, Shield, TrendingUp, ArrowRight, Wallet, Play, CheckCircle } from 'lucide-react';

const AboutSunYield: React.FC = () => {
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
              What is SunYield?
            </h1>
            <p className="hero-subtitle mb-8">
              We're democratizing solar ownership by connecting individuals to real solar projects, 
              making clean energy investment accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To accelerate India's transition to clean energy by making solar investment accessible, 
                transparent, and rewarding for everyone.
              </p>
              <p className="text-gray-600 mb-6">
                We believe that solar energy should be accessible to all, not just those with rooftops 
                or large capital. Through our innovative platform, we're breaking down barriers and 
                creating opportunities for individuals to participate in the clean energy revolution.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="btn-primary flex items-center justify-center space-x-2 group"
                >
                  <span>Learn How It Works</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Globe className="h-6 w-6 text-green-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Clean Energy for All</h4>
                    <p className="text-sm text-gray-600">Making solar energy accessible to every Indian</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Impact</h4>
                    <p className="text-sm text-gray-600">Supporting schools, hospitals, and institutions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sustainable Growth</h4>
                    <p className="text-sm text-gray-600">Creating long-term value for investors and society</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-xl text-gray-600">We bridge the gap between solar projects and individual investors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Identification</h3>
              <p className="text-gray-600 text-sm">
                We identify and partner with schools, hospitals, and institutions that want to go solar 
                but lack the upfront capital or technical expertise.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Management</h3>
              <p className="text-gray-600 text-sm">
                We handle all technical aspects including installation, maintenance, monitoring, 
                and regulatory compliance for each solar project.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Investor Connection</h3>
              <p className="text-gray-600 text-sm">
                We connect individual investors to these projects, allowing them to earn rewards 
                based on actual energy production without owning physical assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SunYield?</h2>
            <p className="text-xl text-gray-600">We're different from traditional investment platforms</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real Projects</h3>
              <p className="text-gray-600 text-sm">
                Every investment connects to actual solar installations on real buildings and institutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Returns</h3>
              <p className="text-gray-600 text-sm">
                Your rewards are directly linked to actual energy production, not market speculation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Risk</h3>
              <p className="text-gray-600 text-sm">
                No asset ownership, no maintenance hassles, no technical complications.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Impact</h3>
              <p className="text-gray-600 text-sm">
                Support clean energy adoption while earning attractive returns on your investment.
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

export default AboutSunYield; 