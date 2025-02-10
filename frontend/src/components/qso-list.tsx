'use client';

import { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/lib/auth';
import { APIError } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface QSO {
  id: number;
  initiator: number;
  initiator_callsign: string;
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
  const [error, setError] = useState<string>('');
  const { token, user } = useAuthStore();

  const fetchQSOs = useCallback(async () => {
    if (!token || !user?.call_sign) return;

    try {
      const response = await axios.get<QSO[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQsos(response.data);
      setError('');
    } catch (error) {
      const apiError = error as APIError;
      setError('Failed to fetch QSO contacts. Please try again.');
      console.error('Failed to fetch QSOs:', apiError);
    }
  }, [token, user?.call_sign]);

  const deleteQSO = async (id: number) => {
    if (!token) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchQSOs();
      setError('');
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.response?.data?.detail) {
        setError(apiError.response.data.detail);
      } else {
        setError('Failed to delete QSO. It may be already confirmed.');
      }
      console.error('Failed to delete QSO:', apiError);
    }
  };

  useEffect(() => {
    fetchQSOs();
  }, [fetchQSOs]);

  return (
    <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Your QSO Contacts</h2>
      
      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {qsos.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No QSO contacts found. Start logging your contacts using the form above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-2">Date/Time</th>
                <th className="text-left p-2">Contact Station</th>
                <th className="text-left p-2">Grid Square</th>
                <th className="text-left p-2">Frequency</th>
                <th className="text-left p-2">Mode</th>
                <th className="text-center p-2">Status</th>
                <th className="text-center p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {qsos.map((qso) => (
                <tr key={qso.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-2">
                    {new Date(qso.datetime).toLocaleString()}
                  </td>
                  <td className="p-2">
                    {qso.recipient}
                  </td>
                  <td className="p-2">
                    {qso.recipient_location}
                  </td>
                  <td className="p-2">{qso.frequency} MHz</td>
                  <td className="p-2">{qso.mode}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        qso.confirmed
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {qso.confirmed ? 'Confirmed' : 'Pending Match'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {!qso.confirmed && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="p-2 text-red-400 hover:text-red-300 transition"
                            title="Delete unconfirmed QSO"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete QSO Contact</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Are you sure you want to delete this unconfirmed QSO contact? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQSO(qso.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
