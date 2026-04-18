import React from 'react';
import { SignupForm } from '../components/Auth';
import { BarChart3, Zap, Users } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <div className="text-white hidden md:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BarChart3 size={32} />
              </div>
              <h1 className="text-4xl font-bold">RetailPulse</h1>
            </div>

            <h2 className="text-3xl font-bold mb-6">
              Get Started Today
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Zap className="flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold">Quick Setup</h3>
                  <p className="text-purple-100 text-sm">Start analyzing in minutes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-purple-100 text-sm">Invite users to your workspace</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Signup Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
