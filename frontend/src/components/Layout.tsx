import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Zap, 
  Wallet, 
  User, 
  LogOut,
  Menu,
  X,
  Heart,
  FileText,
  TrendingUp
} from 'lucide-react';

const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Projects', href: '/app/projects', icon: Zap },
    { name: 'Subscriptions', href: '/app/subscriptions', icon: FileText },
    { name: 'Earnings', href: '/app/earnings', icon: TrendingUp },
    { name: 'Wallet', href: '/app/wallet', icon: Wallet },
    { name: 'Engagement', href: '/app/engagement', icon: Heart },
    { name: 'Profile', href: '/app/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-all duration-300 transform hover:scale-105 group"
              >
                <Zap className="h-8 w-8 text-white mr-2 group-hover:scale-110 transition-transform duration-300" />
                <h1 className="text-xl font-bold text-white">Solar Capital</h1>
              </button>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-green-100 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg">
          <div className="flex h-16 items-center px-6 bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-all duration-300 transform hover:scale-105 group"
              >
                <Zap className="h-8 w-8 text-white mr-2 group-hover:scale-110 transition-transform duration-300" />
                <h1 className="text-xl font-bold text-white">Solar Capital</h1>
              </button>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-green-100 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-green-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center hover:opacity-80 transition-all duration-300 transform hover:scale-105 group"
            >
              <Zap className="h-6 w-6 text-green-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <h1 className="text-lg font-bold text-gray-900">Solar Capital</h1>
            </button>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 