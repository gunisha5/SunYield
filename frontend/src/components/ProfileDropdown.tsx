import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  LogOut, 
  Settings, 
  TrendingUp, 
  CreditCard, 
  Users,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md"
      >
        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {getInitials(user?.fullName || 'User')}
        </div>
        <span className="text-gray-700 font-medium hidden sm:block">
          {user?.fullName || 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {getInitials(user?.fullName || 'User')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation('/app/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigation('/app/earnings')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => handleNavigation('/app/subscriptions')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </button>



            <button
              onClick={() => handleNavigation('/app/engagement')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <Users className="h-4 w-4" />
              <span>Engagement</span>
            </button>

            <button
              onClick={() => handleNavigation('/app/profile')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
