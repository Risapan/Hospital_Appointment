import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Activity, Lock, Mail, AlertCircle, Shield, User, Stethoscope, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = new URLSearchParams(location.search).get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Wait for user state to be settled
      setTimeout(() => {
        const stored = localStorage.getItem('carepoint_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (redirectPath) {
            navigate(redirectPath);
          } else {
            switch (u.role) {
              case 'ADMIN': navigate('/admin/dashboard'); break;
              case 'DOCTOR': navigate('/doctor/dashboard'); break;
              case 'RECEPTIONIST': navigate('/receptionist/dashboard'); break;
              case 'PATIENT':
              default:
                navigate('/patient/dashboard'); break;
            }
          }
        } else {
          navigate('/');
        }
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || (err.response?.status === 401 ? 'Invalid email or password.' : 'Cannot reach the server. Is the backend running on port 8080?'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy-900 text-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-navy-950">Sign In to East Care Point</h2>
          <p className="text-xs text-slate-500 font-medium">Access your hospital portal and manage appointments</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('patient@hospital.lk', 'patient123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center gap-2 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <div>
                <span className="font-bold block text-navy-950 text-[11px]">Patient</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">patient@hospital.lk</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('thirukumar.v@hospital.lk', 'doctor123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center gap-2 transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <div>
                <span className="font-bold block text-navy-950 text-[11px]">Doctor</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Prof. V. Thirukumar</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('receptionist@hospital.lk', 'receptionist123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center gap-2 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <div>
                <span className="font-bold block text-navy-950 text-[11px]">Receptionist</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Front Desk</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hospital.lk', 'admin123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center gap-2 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <div>
                <span className="font-bold block text-navy-950 text-[11px]">Administrator</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Full System</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800">
            Register as a Patient
          </Link>
        </p>
      </div>
    </div>
  );
};
