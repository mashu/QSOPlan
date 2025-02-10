'use client';

import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/admin/`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-6">
      <div className="max-w-md mx-auto pt-16 text-white text-center">
        Redirecting to admin interface...
      </div>
    </div>
  );
}
