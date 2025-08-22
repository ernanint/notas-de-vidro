import { useState } from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useAuth } from "../hooks/useAuth";
import { AuthScreen } from "./AuthScreen";

export const Layout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Glass Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="w-full h-full"
          style={{
            background: 'var(--background)',
          }}
        />
        {/* Animated Glass Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-2xl animate-pulse delay-500" />
      </div>

      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};