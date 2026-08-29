'use client';

import { useState } from 'react';
import {
  Zap,
  MapPin,
  User,
  ShieldCheck,
  Layers,
  Info,
  Phone,
  Menu,
  X,
  Shield,
  FileText,
  Bot,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { UserDropdown } from '@/components/user/UserDropdown';

export function NavigationHeader() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const isAboutPath = pathname === '/about';
  const isContactPath = pathname === '/contact' || pathname === '/contact-us';
  const isMapPath = pathname === '/';
  const { user, isSiteAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenAIChat = () => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ev:open-chat'));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-2 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Driver Map Link */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
              isMapPath
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            <span>Driver Map</span>
          </Link>

          {/* AI Guide Trigger Link */}
          <button
            type="button"
            onClick={handleOpenAIChat}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm text-brand-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 shadow-sm transition-colors"
          >
            <Bot className="h-4 w-4 text-brand-600" />
            <span>AI Assistant</span>
            <span className="rounded-full bg-brand-200/70 px-1.5 py-0.2 text-[9px] font-bold text-brand-800 uppercase">
              NEW
            </span>
          </button>

          {/* About Link */}
          <Link
            href="/about"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
              isAboutPath
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Info className="h-4 w-4 text-slate-500" />
            <span>About</span>
          </Link>

          {/* Contact Link */}
          <Link
            href="/contact"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
              isContactPath
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Phone className="h-4 w-4 text-slate-500" />
            <span>Contact</span>
          </Link>

          {/* If logged in: Portal Link + User Dropdown */}
          {user ? (
            <>
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
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
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors ml-1"
            >
              <User className="h-3.5 w-3.5" />
              <span>Host Sign In</span>
            </Link>
          )}
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={handleOpenAIChat}
            className="flex items-center gap-1 rounded-xl bg-brand-50 border border-brand-200 px-2.5 py-1.5 text-xs font-bold text-brand-700"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-4 w-4 text-brand-600" />
            <span>AI</span>
          </button>

          {user && <UserDropdown />}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200/80 bg-white px-4 py-3 md:hidden space-y-1 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
              isMapPath ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            <span>Driver Map</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAIChat}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="h-4 w-4 text-emerald-600" />
              <span>ChargeBot AI Assistant</span>
            </div>
            <span className="rounded-full bg-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-900">
              NEW
            </span>
          </button>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
              isAboutPath ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="h-4 w-4 text-slate-500" />
            <span>About Us</span>
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
              isContactPath ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Phone className="h-4 w-4 text-slate-500" />
            <span>Contact Us &amp; Support</span>
          </Link>

          <Link
            href="/privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Shield className="h-4 w-4 text-slate-500" />
            <span>Privacy Policy</span>
          </Link>

          <Link
            href="/usage-policy"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Usage Policy &amp; Terms</span>
          </Link>

          <div className="pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              {user ? (
                <span>{isSiteAdmin ? 'Go to Admin Hub' : 'My Charging Stations'}</span>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>Station Host Sign In / Sign Up</span>
                </>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

