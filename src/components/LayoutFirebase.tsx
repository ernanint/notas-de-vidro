import { Outlet } from "react-router-dom";
import { BottomNavigationFirebase } from "./BottomNavigationFirebase";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { AuthScreenFirebase } from "./AuthScreenFirebase";

export const LayoutFirebase = () => {
  const { isAuthenticated, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Carregando Firebase...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreenFirebase />;
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

      <BottomNavigationFirebase />
    </div>
  );
};
