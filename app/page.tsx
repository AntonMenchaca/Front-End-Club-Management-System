'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      // Check user role to redirect appropriately
      const user = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('user') || '{}')
        : {};
      
      const userRole = user.Role_Name || user.role;
      
      // Admin goes to dashboard, others to events
      if (userRole === 'Admin') {
        router.push('/dashboard');
      } else {
        router.push('/events');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
