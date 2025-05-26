"use client";

import React from 'react';
import { useAuth } from '@/utils/AuthContext'; // Assuming AuthContext is in @/utils

const LogoutButton: React.FC = () => {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect or further actions can be handled here or by onAuthStateChanged in AuthContext
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;
