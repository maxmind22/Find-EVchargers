'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/20 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">
        An unexpected error occurred while loading this view.
      </p>
      <button
        onClick={() => reset()}
        className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
