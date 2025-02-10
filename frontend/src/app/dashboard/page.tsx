'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import QSOList from '@/components/qso-list';
import QSOForm from '@/components/qso-form';
import api from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { token, setUser } = useAuthStore();
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/user/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, [token, router, setUser]);

  const handleQSOSuccess = () => {
    setKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">QSO Logger Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/settings"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Settings
            </Link>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
        <QSOForm onSuccess={handleQSOSuccess} />
        <QSOList key={key} />
      </div>
    </main>
  );
}
