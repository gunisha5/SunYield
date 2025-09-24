import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { 
  Zap,
  Wallet,
  Calculator,
  Menu,
  X
} from 'lucide-react';

interface SharedNavigationProps {
  currentPage?: string;
}

const SharedNavigation: React.FC<SharedNavigationProps> = ({ currentPage = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For logged-in users, show the app navigation
  if (isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - SunYield Logo */}
            <div className="flex items-center -ml-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors pl-8 group"
                >
                  <Zap className="h-8 w-8 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  SunYield
                </button>
              </div>
            </div>
            
            {/* Center - Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className={`font-medium transition-colors ${
                  location.pathname === '/' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className={`font-medium transition-colors ${
                  location.pathname === '/how-it-works' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/about')}
                className={`font-medium transition-colors ${
                  location.pathname === '/about' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/benefits')}
                className={`font-medium transition-colors ${
                  location.pathname === '/benefits' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => navigate('/app/projects')}
                className={`font-medium transition-colors ${
                  location.pathname === '/app/projects' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Projects
              </button>
            </div>
            
            {/* Right side - Compact Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Calculator Icon Only */}
              <button
                onClick={() => navigate('/solar-calculator')}
                className="p-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                title="Solar Calculator"
              >
                <Calculator className="h-5 w-5" />
              </button>
              
              {/* Wallet Icon Only */}
              <button
                onClick={() => navigate('/app/wallet')}
                className="p-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                title="Main Wallet"
              >
                <Wallet className="h-5 w-5" />
              </button>
              
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                title="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => {
                    navigate('/how-it-works');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    navigate('/about');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    navigate('/benefits');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Benefits
                </button>
                <button
                  onClick={() => {
                    navigate('/app/projects');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Projects
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // For non-logged-in users, show the public navigation
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - SunYield Logo */}
          <div className="flex items-center -ml-8">
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors pl-8 group"
              >
                <Zap className="h-8 w-8 mr-2 group-hover:scale-110 transition-transform duration-200" />
                SunYield
              </button>
            </div>
          </div>
          
          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`font-medium transition-colors ${
                location.pathname === '/' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className={`font-medium transition-colors ${
                location.pathname === '/how-it-works' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/about')}
              className={`font-medium transition-colors ${
                location.pathname === '/about' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => navigate('/benefits')}
              className={`font-medium transition-colors ${
                location.pathname === '/benefits' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Benefits
            </button>
            <button
              onClick={() => navigate('/projects')}
              className={`font-medium transition-colors ${
                location.pathname === '/projects' ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Explore Projects
            </button>
          </div>
          
          {/* Right side - Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SharedNavigation;