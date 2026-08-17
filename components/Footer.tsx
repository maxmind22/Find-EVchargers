import Link from 'next/link';
import { Zap, Shield, FileText, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-2 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                EVchargers
                <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 uppercase tracking-wider">
                  Kigali
                </span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Rwanda&apos;s premier open platform for discovering, listing, and monitoring electric vehicle charging infrastructure. Supporting green mobility and zero-emission transportation across Kigali and beyond.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live network coverage across Gasabo, Kicukiro &amp; Nyarugenge</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Driver Map
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-brand-600 transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Station Host Portal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Supported Standards & Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Standards &amp; Tech
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                <span>GB/T DC &amp; AC (Rwanda standard)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500"></span>
                <span>CCS Type 2 Fast Charging</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Type 2 AC Mennekes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                <span>CHAdeMO &amp; NACS Adapters</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-brand-600" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/usage-policy"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-brand-600" />
                  <span>Usage &amp; Terms</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-600" />
                  <span>Report Station Issue</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EVchargers Kigali. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/usage-policy" className="hover:text-slate-600 transition-colors">
              Usage Policy
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-600 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
