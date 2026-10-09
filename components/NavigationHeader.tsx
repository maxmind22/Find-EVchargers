'use client';

import { useState, useEffect } from 'react';
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
import { Logo } from '@/components/Logo';

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

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center" onClick={() => setMobileMenuOpen(false)}>
            <Logo size="md" />
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
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={handleOpenAIChat}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200/90 px-3 text-xs font-bold text-brand-700 shadow-2xs active:scale-95 transition-transform"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-4 w-4 text-brand-600" />
            <span>AI</span>
          </button>

          {user && <UserDropdown />}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Scrim Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[57px] z-20 bg-slate-900/50 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-30 border-t border-slate-200 bg-white px-4 py-3 md:hidden space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isMapPath ? 'bg-brand-50 text-brand-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>Driver Map</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenAIChat}
              className="flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Bot className="h-4 w-4 text-emerald-600" />
                <span>ChargeBot AI Assistant</span>
              </div>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                NEW
              </span>
            </button>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isAboutPath ? 'bg-brand-50 text-brand-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Info className="h-4 w-4 text-slate-500" />
              <span>About Us</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isContactPath ? 'bg-brand-50 text-brand-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Phone className="h-4 w-4 text-slate-500" />
              <span>Contact Us &amp; Support</span>
            </Link>

            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <Shield className="h-4 w-4 text-slate-500" />
              <span>Privacy Policy</span>
            </Link>

            <Link
              href="/usage-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Usage Policy &amp; Terms</span>
            </Link>

            <div className="pt-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-98 transition-all"
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
        </>
      )}
    </header>
  );
}

