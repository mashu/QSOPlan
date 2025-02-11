'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/auth';
import { APIError } from '@/lib/types';
import api from '@/lib/api';
import GridMapSelector from './grid-map';

interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  call_sign: string;
  default_grid_square: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegistrationDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    call_sign: '',
    default_grid_square: '',
  });

  const [error, setError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convert call_sign and grid_square to uppercase
    if (name === 'call_sign' || name === 'default_grid_square') {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Register the user
      await api.post('/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        call_sign: formData.call_sign,
        default_grid_square: formData.default_grid_square || undefined,
      });

      // Log in the user
      await login(formData.username, formData.password);

      // Close the dialog and redirect
      onOpenChange(false);
      router.push('/dashboard');
    } catch (error) {
      const apiError = error as APIError;
      const errorMessage = apiError.response?.data?.detail ||
                          Object.values(apiError.response?.data || {}).join(', ') ||
                          'Registration failed';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6">Register Account</h2>

          {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-1">Call Sign</label>
              <input
                type="text"
                name="call_sign"
                value={formData.call_sign}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
                maxLength={10}
                pattern="[A-Z0-9]{3,10}"
                title="Call sign must be 3-10 alphanumeric characters"
              />
            </div>

            <div>
              <label className="block text-white mb-1">Grid Square (Optional)</label>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  name="default_grid_square"
                  value={formData.default_grid_square}
                  onChange={handleInputChange}
                  className="col-span-3 p-2 rounded bg-white/5 border border-white/20 text-white"
                  maxLength={6}
                  pattern="[A-Z]{2}[0-9]{2}[A-Z]{2}"
                  title="Grid square must be in format AA00AA"
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

            <div>
              <label className="block text-white mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-white mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                required
                minLength={8}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Select Your Location
            </h3>
            <GridMapSelector
              onLocationSelect={(gridSquare) => {
                setFormData(prev => ({ ...prev, default_grid_square: gridSquare }));
                setMapOpen(false);
              }}
            />
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
    </Dialog>
  );
}
