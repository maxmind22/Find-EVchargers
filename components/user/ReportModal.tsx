'use client';

import { Station } from '@/lib/types';
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ReportModalProps {
  station: Station;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TYPES = [
  { id: 'BROKEN_CONNECTOR', label: 'Broken / Damaged Plug' },
  { id: 'OCCUPIED_BY_ICE', label: 'Blocked by non-EV car' },
  { id: 'ACCESS_BLOCKED', label: 'Access gate / barrier closed' },
  { id: 'PRICING_INCORRECT', label: 'Pricing info incorrect' },
  { id: 'OTHER', label: 'Other issue' },
];

export function ReportModal({ station, isOpen, onClose }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState('BROKEN_CONNECTOR');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate feedback submission
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank You!</h3>
            <p className="mt-1 text-sm text-slate-500">
              Your report has been submitted to keep our community map accurate.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Report an Issue</h3>
                <p className="text-xs text-slate-500 truncate max-w-[260px]">
                  {station.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  What is the issue?
                </label>
                <div className="space-y-2">
                  {REPORT_TYPES.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-colors ${
                        selectedType === t.id
                          ? 'border-brand-500 bg-brand-50/60 font-semibold text-brand-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{t.label}</span>
                      <input
                        type="radio"
                        name="report_type"
                        value={t.id}
                        checked={selectedType === t.id}
                        onChange={() => setSelectedType(t.id)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g., Plug #2 screen displays error code 404..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
