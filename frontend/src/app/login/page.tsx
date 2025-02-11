'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';
import axios from 'axios';
import RegistrationDialog from '@/components/registration-dialog';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || 
                         'Invalid credentials or account not activated';
        setError(errorMessage);
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-6">
      <div className="max-w-md mx-auto pt-16">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            ← Back to Rankings
          </Link>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="bg-white/10 p-6 rounded-lg backdrop-blur-lg space-y-4"
        >
          <h1 className="text-2xl font-bold text-white mb-6">Login to QSO Logger</h1>
          
          {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="username" className="block text-white">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setRegistrationOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Need an account? Register here
            </button>
          </div>
        </form>
      </div>

      <RegistrationDialog 
        open={registrationOpen}
        onOpenChange={setRegistrationOpen}
      />
    </main>
  );
}
