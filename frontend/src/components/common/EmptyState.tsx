import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      {icon && <div className="mb-4 p-4 bg-slate-50 text-slate-400 rounded-full">{icon}</div>}
      <h3 className="text-lg font-bold text-navy-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="secondary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
