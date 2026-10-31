import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HistoryNav } from '../common/HistoryNav';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  User,
  Users,
  Building2,
  Hospital,
  Clock,
  Shield,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Analytics & Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Doctors Management', path: '/admin/doctors', icon: Users },
          { name: 'Hospitals', path: '/admin/hospitals', icon: Hospital },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'Appointment Records', path: '/admin/appointments', icon: Calendar },
          { name: 'User Accounts', path: '/admin/users', icon: Shield },
          { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: FileText },
        ];
      case 'DOCTOR':
        return [
          { name: 'Dashboard Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Appointment Calendar', path: '/doctor/appointments', icon: Calendar },
          { name: 'Working Hours & Slots', path: '/doctor/schedule', icon: Clock },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Front Desk Overview', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { name: 'Patient Search & Walk-ins', path: '/receptionist/patients', icon: Search },
          { name: 'Today’s Schedule', path: '/receptionist/daily-schedule', icon: Calendar },
          { name: 'Find Specialists', path: '/doctors', icon: Users },
        ];
      case 'PATIENT':
      default:
        return [
          { name: 'Patient Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Find Doctors & Book', path: '/doctors', icon: Search },
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Personal Medical Profile', path: '/patient/profile', icon: User },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-18 flex items-center justify-between px-6 border-b border-navy-900">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-navy-950 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                East Care<span className="text-teal-400">Point</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="px-6 py-5 border-b border-navy-900/60 bg-navy-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-400 text-navy-950 font-bold flex items-center justify-center text-sm shadow-md">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                  {role} PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500 text-navy-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-navy-900 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-navy-900 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Portal
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <HistoryNav />
              <div>
                <h1 className="text-xl font-black text-navy-950">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {actions}
              <Link
                to="/notifications"
                className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};
