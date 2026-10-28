import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-3xl font-black text-navy-950">403 Access Denied</span>
      <h2 className="text-xl font-bold text-navy-900">Restricted Hospital Area</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        Your current user role does not possess administrative authorization to view this protected resource.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
            Hospital Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
