// frontend/src/components/qso-list.tsx
'use client';

import { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/lib/auth';
import { APIError } from '@/lib/types';

interface QSO {
  id: number;
  recipient: string;
  frequency: number;
  mode: string;
  datetime: string;
  initiator_location: string;
  recipient_location: string;
  confirmed: boolean;
}

export default function QSOList() {
  const [qsos, setQsos] = useState<QSO[]>([]);
  const { token } = useAuthStore();

  const fetchQSOs = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get<QSO[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQsos(response.data);
    } catch (error) {
      const apiError = error as APIError;
      console.error('Failed to fetch QSOs:', apiError);
    }
  }, [token]);

  useEffect(() => {
    fetchQSOs();
  }, [fetchQSOs]);

  return (
    <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Your QSO Contacts</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-2">Date/Time</th>
              <th className="text-left p-2">Contact</th>
              <th className="text-left p-2">Frequency</th>
              <th className="text-left p-2">Mode</th>
              <th className="text-left p-2">Their Grid</th>
              <th className="text-center p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {qsos.map((qso) => (
              <tr key={qso.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-2">
                  {new Date(qso.datetime).toLocaleString()}
                </td>
                <td className="p-2">{qso.recipient}</td>
                <td className="p-2">{qso.frequency} MHz</td>
                <td className="p-2">{qso.mode}</td>
                <td className="p-2">{qso.recipient_location}</td>
                <td className="p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      qso.confirmed
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {qso.confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
