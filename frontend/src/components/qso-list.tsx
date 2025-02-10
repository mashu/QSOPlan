// src/components/qso-list.tsx
'use client';

import { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/lib/auth';
import { APIError } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface QSO {
 id: number;
 initiator: string;
 recipient: string;
 frequency: number;
 mode: string;
 datetime: string;
 initiator_location: string;
 recipient_location: string;
 confirmed: boolean;
}

interface NormalizedQSO {
 id: number;
 station1: string;
 station2: string;
 frequency: number;
 mode: string;
 datetime: string;
 location1: string;
 location2: string;
 confirmed: boolean;
}

export default function QSOList() {
 const [qsos, setQsos] = useState<NormalizedQSO[]>([]);
 const { token } = useAuthStore();

 const normalizeQSOs = (data: QSO[]): NormalizedQSO[] => {
  const qsoMap = new Map<string, {qso1: QSO, qso2?: QSO}>();

  data.forEach(qso => {
    const participants = [qso.initiator, qso.recipient].sort();
    const date = new Date(qso.datetime).toISOString();
    const key = `${participants.join('-')}-${date}`;

    if (!qsoMap.has(key)) {
      qsoMap.set(key, {qso1: qso});
    } else {
      const pair = qsoMap.get(key);
      if (pair) {
        pair.qso2 = qso;
      }
    }
  });

  return Array.from(qsoMap.values()).map(({qso1, qso2}) => {
    const confirmed = qso2 !== undefined;
    return {
      id: qso1.id,
      station1: qso1.recipient,
      station2: qso1.initiator,
      frequency: qso1.frequency,
      mode: qso1.mode,
      datetime: qso1.datetime,
      location1: qso1.recipient_location,
      location2: qso1.initiator_location,
      confirmed
    };
  });
};

 const fetchQSOs = useCallback(async () => {
   if (!token) return;

   try {
     const response = await axios.get<QSO[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });
     setQsos(normalizeQSOs(response.data));
   } catch (error) {
     const apiError = error as APIError;
     console.error('Failed to fetch QSOs:', apiError);
   }
 }, [token]);

 const deleteQSO = async (id: number) => {
   if (!token) return;

   try {
     await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/qsos/${id}/`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });
     await fetchQSOs();
   } catch (error) {
     const apiError = error as APIError;
     console.error('Failed to delete QSO:', apiError);
   }
 };

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
             <th className="text-left p-2">Stations</th>
             <th className="text-left p-2">Locations</th>
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
                 {qso.station1} ↔ {qso.station2}
               </td>
               <td className="p-2">
                 {qso.location1} ↔ {qso.location2}
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
                   {qso.confirmed ? 'Confirmed' : 'Pending'}
                 </span>
               </td>
               <td className="p-2 text-center">
                 {!qso.confirmed && (
                   <AlertDialog>
                     <AlertDialogTrigger asChild>
                       <button className="p-2 text-red-400 hover:text-red-300 transition">
                         <Trash2 className="w-5 h-5" />
                       </button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle>Delete QSO Contact</AlertDialogTitle>
                         <AlertDialogDescription className="text-gray-300">
                           Are you sure you want to delete this unconfirmed QSO contact? This action cannot be undone.
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
   </div>
 );
}
