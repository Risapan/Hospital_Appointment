import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/patient') ||
    location.pathname.startsWith('/doctor') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/receptionist') ||
    location.pathname === '/notifications';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {!isDashboardRoute && <Navbar />}
      <div className="flex-1">
        <AppRoutes />
      </div>
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
