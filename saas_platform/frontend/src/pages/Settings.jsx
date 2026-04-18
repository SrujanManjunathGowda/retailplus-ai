import React, { useState } from 'react';
import { useBusinessStore, useAuthStore } from '../stores';
import { businessService } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const currentBusiness = useBusinessStore((state) => state.currentBusiness);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    name: currentBusiness?.name || '',
    industry: currentBusiness?.industry || '',
    website: currentBusiness?.website || '',
    description: currentBusiness?.description || '',
    emailAlerts: currentBusiness?.settings?.emailAlerts !== false,
    dailyDigest: currentBusiness?.settings?.dailyDigest !== false,
    timezone: currentBusiness?.settings?.timezone || 'UTC',
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentBusiness?._id) return;

    setLoading(true);
    try {
      await businessService.update(currentBusiness._id, {
        name: settings.name,
        industry: settings.industry,
        website: settings.website,
        description: settings.description,
        settings: {
          emailAlerts: settings.emailAlerts,
          dailyDigest: settings.dailyDigest,
          timezone: settings.timezone,
        },
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Business Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Business Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <input
              type="text"
              name="industry"
              value={settings.industry}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={settings.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              rows="4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="ml-3 text-gray-700">Email Alerts</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="dailyDigest"
              checked={settings.dailyDigest}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="ml-3 text-gray-700">Daily Digest</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option>UTC</option>
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Subscription</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Plan:</span>
            <span className="font-semibold capitalize">{currentBusiness?.subscription?.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Status:</span>
            <span className="font-semibold capitalize text-green-600">
              {currentBusiness?.subscription?.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Max Products:</span>
            <span className="font-semibold">{currentBusiness?.subscription?.maxProducts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">API Calls:</span>
            <span className="font-semibold">
              {currentBusiness?.subscription?.apiCallsUsed} / {currentBusiness?.subscription?.apiCallsLimit}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Name:</span>
            <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Email:</span>
            <span className="font-semibold">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Role:</span>
            <span className="font-semibold capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
