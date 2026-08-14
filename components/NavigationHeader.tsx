'use client';

import { Zap, MapPin, User, ShieldCheck, Layers, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { UserDropdown } from '@/components/user/UserDropdown';

export function NavigationHeader() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const { user, isSiteAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-sm sm:px-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-between rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-2 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              EVchargers
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 uppercase tracking-wider">
                Kigali
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation & User Menu */}
      <nav className="flex items-center gap-2 sm:gap-3">
        {/* Driver Map Link */}
        <Link
          href="/"
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
            !isAdminPath
              ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MapPin className="h-4 w-4 text-brand-600" />
          <span>Driver Map</span>
        </Link>

        {/* If logged in: Portal Link + User Dropdown */}
        {user ? (
          <>
            <Link
              href="/admin"
              className={`hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
                isAdminPath
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isSiteAdmin ? (
                <ShieldCheck className="h-4 w-4 text-amber-400" />
              ) : (
                <Layers className="h-4 w-4 text-emerald-600" />
              )}
              <span>{isSiteAdmin ? 'Admin Hub' : 'My Chargers'}</span>
            </Link>

            {/* User Dropdown */}
            <UserDropdown />
          </>
        ) : (
          /* If not logged in: Sign In / Sign Up button */
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            <span>Sign In / Sign Up</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
