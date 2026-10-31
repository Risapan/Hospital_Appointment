import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HistoryNav } from '../common/HistoryNav';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Activity, Bell, User, LogOut, LayoutDashboard, Calendar, Menu, X, Shield, Stethoscope, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getUnreadCount()
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0));
    }
  }, [isAuthenticated, location.pathname]);

  const getDashboardPath = () => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'DOCTOR': return '/doctor/dashboard';
      case 'RECEPTIONIST': return '/receptionist/dashboard';
      case 'PATIENT':
      default:
        return '/patient/dashboard';
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Shield className="w-2.5 h-2.5"/>Admin</span>;
      case 'DOCTOR':
        return <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Stethoscope className="w-2.5 h-2.5"/>Doctor</span>;
      case 'RECEPTIONIST':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><UserCheck className="w-2.5 h-2.5"/>Reception</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-3">
          <HistoryNav />
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-teal-400 flex items-center justify-center shadow-md group-hover:bg-navy-800 transition-colors">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-navy-950 flex items-center gap-1">
                East Care<span className="text-teal-600">Point</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">Batticaloa Doctor Booking</span>
            </div>
          </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/book"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/book' ? 'text-teal-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Book
            </Link>
            <Link
              to="/doctors"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/doctors' ? 'text-teal-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Find Doctors
            </Link>
            <Link
              to="/hospitals"
              className={`text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/hospitals') ? 'text-teal-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Hospitals
            </Link>
            <Link
              to="/departments"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/departments' ? 'text-teal-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Departments
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/about' ? 'text-teal-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              About Us
            </Link>
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard Quick Button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 bg-navy-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-navy-800 transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  Dashboard
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                        {user.fullName.split(' ')[0]}
                        {getRoleBadge()}
                      </div>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-navy-950 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        {role === 'PATIENT' && (
                          <>
                            <Link
                              to="/patient/appointments"
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              My Appointments
                            </Link>
                            <Link
                              to="/patient/profile"
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              Medical Profile
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-navy-900 px-3 py-2 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/book"
                  className="bg-navy-900 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-navy-800 transition-colors shadow-sm"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          <Link
            to="/doctors"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700"
          >
            Find Doctors
          </Link>
          <Link
            to="/book"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-teal-700"
          >
            Book Appointment
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700"
          >
            Hospitals
          </Link>
          <Link
            to="/departments"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700"
          >
            Departments
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700"
          >
            About Us
          </Link>
          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-teal-600"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-bold text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-bold text-slate-700 bg-slate-50 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-bold text-white bg-navy-900 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
