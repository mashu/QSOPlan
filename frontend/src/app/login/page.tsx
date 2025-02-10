'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface UserRanking {
  call_sign: string;
  confirmed_contacts: number;
  total_contacts: number;
}

export default function Home() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        console.log('Fetching rankings...');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/rankings/`);
        console.log('Rankings response:', response.data);
        setRankings(response.data);
        setError('');
      } catch (error: any) {
        console.error('Failed to fetch rankings:', {
          error: error,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Failed to load rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">QSO Logger Rankings</h1>
          <Link 
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </Link>
        </div>

        {loading ? (
          <div className="text-white text-center py-8">Loading rankings...</div>
        ) : error ? (
          <div className="bg-red-500/20 text-red-200 p-4 rounded text-center">
            {error}
          </div>
        ) : rankings.length === 0 ? (
          <div className="bg-white/10 p-6 rounded-lg text-white text-center">
            No QSO contacts recorded yet.
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg backdrop-blur-lg overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">Call Sign</th>
                  <th className="p-4 text-center">Confirmed QSOs</th>
                  <th className="p-4 text-center">Total QSOs</th>
                  <th className="p-4 text-center">Confirmation Rate</th>
                </tr>
              </thead>
              <tbody>
                {rankings
                  .sort((a, b) => b.confirmed_contacts - a.confirmed_contacts)
                  .map((user, index) => (
                    <tr 
                      key={user.call_sign} 
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="p-4">#{index + 1}</td>
                      <td className="p-4 font-medium">{user.call_sign}</td>
                      <td className="p-4 text-center">{user.confirmed_contacts}</td>
                      <td className="p-4 text-center">{user.total_contacts}</td>
                      <td className="p-4 text-center">
                        {user.total_contacts > 0 
                          ? ((user.confirmed_contacts / user.total_contacts) * 100).toFixed(1)
                          : '0'}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
