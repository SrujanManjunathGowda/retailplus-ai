import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'bg-blue-100 text-blue-700' : '';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">RetailPulse</h1>
          <p className="text-sm text-gray-400 mt-1">AI Review Analysis</p>
        </div>

        <nav className="mt-8">
          <Link
            to="/dashboard"
            className={`block px-4 py-3 hover:bg-gray-800 transition ${isActive('/dashboard')}`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/products"
            className={`block px-4 py-3 hover:bg-gray-800 transition ${isActive('/products')}`}
          >
            📦 Products
          </Link>
          <Link
            to="/reviews"
            className={`block px-4 py-3 hover:bg-gray-800 transition ${isActive('/reviews')}`}
          >
            ⭐ Reviews
          </Link>
          <Link
            to="/analytics"
            className={`block px-4 py-3 hover:bg-gray-800 transition ${isActive('/analytics')}`}
          >
            📈 Analytics
          </Link>
          <Link
            to="/settings"
            className={`block px-4 py-3 hover:bg-gray-800 transition ${isActive('/settings')}`}
          >
            ⚙️ Settings
          </Link>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 w-64 border-t border-gray-700 p-4">
          <div className="text-sm mb-3">
            <p className="text-gray-300">{user?.firstName}</p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {getPageTitle(location.pathname)}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  const titles = {
    '/dashboard': 'Dashboard',
    '/products': 'Products',
    '/reviews': 'Reviews',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
  };
  return titles[pathname] || 'RetailPulse';
}
