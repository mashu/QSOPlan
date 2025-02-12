'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/lib/auth';
import api from '@/lib/api';
import { APIError } from '@/lib/types';
import GridMapSelector from '@/components/grid-map';
import { Dialog } from '@/components/ui/dialog';

export default function Settings() {
  const router = useRouter();
  const { token, user, setUser } = useAuthStore();
  const [mapOpen, setMapOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    call_sign: '',
    default_grid_square: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [token, router]);

  const handleLocationSelect = (gridSquare: string) => {
    setFormData(prev => ({ ...prev, default_grid_square: gridSquare }));
    setMapOpen(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.put('/api/user/profile/', 
        { email: formData.email, default_grid_square: formData.default_grid_square },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setUser({ ...user!, ...response.data });
      setMessage('Profile updated successfully');
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.post('/api/user/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setMessage('Password changed successfully');
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <Link 
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {message && (
          <div className="bg-green-500/20 text-green-200 p-4 rounded mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Profile Settings</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Call Sign</label>
              <input
                type="text"
                value={formData.call_sign}
                disabled
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white opacity-50 cursor-not-allowed"
              />
              <p className="text-sm text-gray-400 mt-1">
                Call sign can only be changed by an administrator
              </p>
            </div>

            <div>
              <label className="block text-white mb-2">Default Grid Square</label>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={formData.default_grid_square}
                  onChange={(e) => setFormData({ ...formData, default_grid_square: e.target.value.toUpperCase() })}
                  className="col-span-3 p-2 rounded bg-white/5 border border-white/20 text-white"
                  pattern="[A-Z0-9]{6}"
                  title="Grid square must be exactly 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="p-2 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  Map
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Update Profile
            </button>
          </form>
        </div>

        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg">
          <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Select Your Default Location
            </h3>
            <GridMapSelector onLocationSelect={handleLocationSelect} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setMapOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
