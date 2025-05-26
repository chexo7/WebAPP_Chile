"use client";

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import AppNavigation from '@/components/AppNavigation';
import { DataProvider, useData } from '@/utils/DataContext'; // Import DataProvider and useData
import DataVersionSelector from '@/components/DataVersionSelector'; // Import DataVersionSelector

// Inner component to consume DataContext and decide rendering
const AuthenticatedContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isDataLoaded, resetDataState } = useData(); // Consume DataContext
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      resetDataState(); // Clear any existing data state on logout/auth failure
      router.push('/login');
    }
  }, [currentUser, authLoading, router, resetDataState]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading authentication status...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Redirecting to login...</p>
      </div>
    );
  }

  // User is authenticated
  if (!isDataLoaded) {
    // If data is not loaded, show the DataVersionSelector
    return <DataVersionSelector />;
  }

  // Data is loaded, show the main app content
  return (
    <>
      <AppNavigation />
      {children}
    </>
  );
};

const AuthenticatedLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <DataProvider> {/* Wrap with DataProvider */}
      <Head>
        <title>Dashboard - Financial App</title>
      </Head>
      {/* You can add a shared layout specific to authenticated pages here, e.g., a sidebar */}
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </DataProvider>
  );
};

export default AuthenticatedLayout;
