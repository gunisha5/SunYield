import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Users, Globe, Award, Shield, TrendingUp, ArrowRight } from 'lucide-react';

const AboutSolarCapital: React.FC = () => {
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
                className="text-green-600 font-semibold border-b-2 border-green-600 pb-1 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/benefits')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
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
              What is Solar Capital?
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Solar Capital?</h2>
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

      {/* Call to Action */}
      <section className="py-16 bg-green-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Join the Solar Revolution</h2>
          <p className="text-xl mb-8">Be part of India's clean energy future while earning attractive returns</p>
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

export default AboutSolarCapital; 