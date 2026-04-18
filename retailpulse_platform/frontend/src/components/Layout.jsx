import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useBusinessStore } from '../stores';
import { BarChart3, TrendingUp, Users, LogOut } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { businesses, currentBusiness, setBusiness, fetchBusinesses } = useBusinessStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (businesses.length === 0) {
      fetchBusinesses();
    }
  }, [user, businesses.length, navigate, fetchBusinesses]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBusinessChange = (business) => {
    setBusiness(business);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RetailPulse</h1>
              <p className="text-xs text-purple-100">AI Review Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Business Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
              >
                {currentBusiness?.name || 'Select Business'} ▼
              </button>
              {showDropdown && (
                <div className="absolute top-full mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl z-10">
                  {businesses.map((business) => (
                    <button
                      key={business._id}
                      onClick={() => handleBusinessChange(business)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 transition"
                    >
                      {business.name}
                      <p className="text-xs text-gray-500">{business.industry || 'No industry'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium">{user?.firstName || user?.email}</p>
                <p className="text-xs text-purple-100">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export const NavBar = ({ links }) => (
  <nav className="bg-white shadow-sm border-b border-gray-200 mb-6">
    <div className="max-w-7xl mx-auto px-6 py-4 flex gap-6">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-gray-600 hover:text-purple-600 font-medium transition"
        >
          {link.label}
        </a>
      ))}
    </div>
  </nav>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition';
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, type = 'text', className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <input
      type={type}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${className}`}
      {...props}
    />
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
