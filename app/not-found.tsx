import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-600 shadow-lg shadow-brand-500/20 mb-4">
        <MapPin className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">404 - Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The charging station or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-colors"
      >
        Back to EV Map
      </Link>
    </div>
  );
}
