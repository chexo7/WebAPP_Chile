"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext'; // Optional: if you want to show a loading state based on auth

const DashboardRedirectPage: React.FC = () => {
  const router = useRouter();
  const { loading: authLoading, currentUser } = useAuth(); // Get auth loading state

  useEffect(() => {
    // Only redirect if auth is not loading and user is available (or determined not to be)
    // This prevents redirecting before AuthContext has initialized
    if (!authLoading) {
      router.replace('/dashboard/gastos');
    }
  }, [authLoading, router]); // Depend on authLoading to wait for auth context

  // Optional: Show a loading message while auth is initializing or redirecting
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Initializing and redirecting to your dashboard...</p>
      </div>
    );
  }
  
  // If not authLoading and redirect hasn't happened (e.g. due to router not being ready)
  // you can show a generic redirecting message or null
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardRedirectPage;
