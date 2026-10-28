import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Activity, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
        <Activity className="w-8 h-8" />
      </div>
      <span className="text-4xl font-black text-navy-950">404</span>
      <h2 className="text-xl font-bold text-navy-900">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        The clinical page or record you are searching for does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Hospital Home
        </Button>
      </Link>
    </div>
  );
};
