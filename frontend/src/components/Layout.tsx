import React from 'react';
import { Outlet } from 'react-router-dom';
import SharedNavigation from './SharedNavigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use SharedNavigation for consistent navigation */}
      <SharedNavigation />
      
      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 