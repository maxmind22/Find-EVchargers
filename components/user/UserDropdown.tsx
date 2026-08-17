'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  PlusCircle,
  MapPin,
  Database,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface UserDropdownProps {
  onAddStationClick?: () => void;
}

export function UserDropdown({ onAddStationClick }: UserDropdownProps) {
  const { user, isSiteAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/admin');
  };

  const initial = (user.name || user.email || 'A').charAt(0).toUpperCase();

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:scale-[0.99]"
      >
        {/* Avatar */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-sm ${
            isSiteAdmin
              ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950'
              : 'bg-gradient-to-tr from-brand-600 to-emerald-400 text-white'
          }`}
        >
          {initial}
        </div>

        {/* Name and Role */}
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
            {user.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
            {isSiteAdmin ? 'Site Admin' : 'Station Host'}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* 1. User Profile Header */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-base font-black shadow-md ${
                  isSiteAdmin
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-brand-500/20'
                }`}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 text-sm">{user.name}</p>
                <p className="truncate text-xs font-mono text-slate-500">{user.email}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="mt-3">
              {isSiteAdmin ? (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 p-2 text-xs font-bold text-amber-900 border border-amber-200">
                  <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide">
                      Super Administrator
                    </p>
                    <p className="text-[10px] text-amber-700 font-medium">
                      Unrestricted access to all Kigali chargers
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 p-2 text-xs font-bold text-blue-900 border border-blue-200">
                  <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide">
                      Station Host Operator
                    </p>
                    <p className="text-[10px] text-blue-700 font-medium">
                      Managing your own registered stations
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Navigation & Shortcuts */}
          <div className="py-1.5 space-y-0.5 text-xs">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>Kigali Driver Map</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <Layers className="h-4 w-4 text-blue-600" />
              <span>{isSiteAdmin ? 'All Network Chargers' : 'My Charging Stations'}</span>
            </Link>

            {onAddStationClick ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddStationClick();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-left"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>Add New Charging Station</span>
              </button>
            ) : (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>Add New Charging Station</span>
              </Link>
            )}

            <div className="border-t border-slate-100 my-1"></div>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <span>About Kigali EV Network</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <span>Contact &amp; Support</span>
            </Link>

            <Link
              href="/privacy"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <span>Privacy Policy</span>
            </Link>

            <Link
              href="/usage-policy"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <span>Usage Policy &amp; Terms</span>
            </Link>
          </div>

          {/* 3. Account ID & Meta Info */}
          <div className="px-3 py-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>User ID</span>
            <span className="truncate max-w-[120px]">{user.id}</span>
          </div>

          {/* 4. Log Out Button */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
