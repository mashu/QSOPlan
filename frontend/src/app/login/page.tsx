// frontend/src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { APIError } from '@/lib/types';
import Link from 'next/link';
import RegisterDialog from '@/components/registration-dialog';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.response?.data?.detail || 'Login failed');
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
              Username / Call Sign
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

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              New user? Register here
            </button>
          </div>
        </form>
      </div>

      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
      />
    </main>
  );
}
