import React from 'react';
import { AppointmentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: AppointmentStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', status, size = 'md' }) => {
  let effectiveVariant = variant;

  if (status) {
    switch (status) {
      case 'CONFIRMED':
        effectiveVariant = 'success';
        break;
      case 'PENDING':
        effectiveVariant = 'warning';
        break;
      case 'CANCELLED':
        effectiveVariant = 'danger';
        break;
      case 'COMPLETED':
        effectiveVariant = 'info';
        break;
      case 'NO_SHOW':
        effectiveVariant = 'neutral';
        break;
    }
  }

  const variants = {
    primary: 'bg-navy-50 text-navy-800 border-navy-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-850 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-teal-50 text-teal-800 border-teal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[effectiveVariant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
