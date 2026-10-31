import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// React Router stores the current position in browser history as history.state.idx.
// We remember the furthest position reached so "Forward" knows whether there is a page ahead.
const MAX_IDX_KEY = 'ecp_history_max_idx';

const currentIdx = (): number => (window.history.state && typeof window.history.state.idx === 'number' ? window.history.state.idx : 0);

const readMaxIdx = (): number => {
  try {
    return Number(sessionStorage.getItem(MAX_IDX_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeMaxIdx = (value: number) => {
  try {
    sessionStorage.setItem(MAX_IDX_KEY, String(value));
  } catch {
    // storage unavailable (private mode); forward button just stays disabled
  }
};

/** Back / Forward buttons that mirror the browser's own history buttons. `showLabels` adds the words. */
export const HistoryNav: React.FC<{ className?: string; showLabels?: boolean }> = ({ className = '', showLabels = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [idx, setIdx] = useState<number>(currentIdx);
  const [maxIdx, setMaxIdx] = useState<number>(readMaxIdx);

  useEffect(() => {
    const now = currentIdx();
    // A new page (PUSH) discards any pages that were ahead; back/forward (POP) keeps them
    const nextMax = navigationType === 'PUSH' ? now : Math.max(readMaxIdx(), now);
    writeMaxIdx(nextMax);
    setIdx(now);
    setMaxIdx(nextMax);
  }, [location.key, navigationType]);

  const canGoBack = idx > 0;
  const canGoForward = idx < maxIdx;

  const buttonClass =
    `${showLabels ? 'inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold' : 'p-2'} ` +
    'rounded-xl border border-slate-200 text-slate-600 bg-white shadow-sm transition-all duration-200 active:scale-[0.98] ' +
    'hover:bg-slate-100 hover:text-navy-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={!canGoBack}
        className={buttonClass}
        aria-label="Go back"
        title="Back"
      >
        <ChevronLeft className="w-4 h-4" />
        {showLabels && 'Back'}
      </button>
      <button
        type="button"
        onClick={() => navigate(1)}
        disabled={!canGoForward}
        className={buttonClass}
        aria-label="Go forward"
        title="Forward"
      >
        {showLabels && 'Forward'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
