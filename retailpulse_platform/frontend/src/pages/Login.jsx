import React from 'react';
import { LoginForm } from '../components/Auth';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="text-white hidden md:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BarChart3 size={32} />
              </div>
              <h1 className="text-4xl font-bold">RetailPulse</h1>
            </div>

            <h2 className="text-3xl font-bold mb-6">
              AI-Powered Review Intelligence
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <TrendingUp className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-purple-100 text-sm">Track sentiment and trends instantly</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Smart Insights</h3>
                  <p className="text-purple-100 text-sm">AI-powered discovery of customer needs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
