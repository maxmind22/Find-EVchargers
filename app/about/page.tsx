import Link from 'next/link';
import { Metadata } from 'next';
import {
  Zap,
  MapPin,
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe2,
  Leaf,
  PlusCircle,
} from 'lucide-react';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Us | EVchargers Kigali - Electric Mobility & Charging Infrastructure',
  description:
    'Learn about EVchargers Kigali, our mission to support Rwanda’s zero-emission electric mobility ecosystem, and how we map DC fast chargers, GB/T, and Type 2 stations.',
};

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 py-16 sm:px-6 sm:py-20 text-white border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>Powering Rwanda&apos;s Clean Transportation Future</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Accelerating Electric Mobility in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-electric-400">Kigali</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            EVchargers is Rwanda&apos;s dedicated open map and management network for EV drivers, fleet operators, and charging station hosts. We eliminate range anxiety with real-time connector data, verified pricing, and instant navigation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-brand-500/25 hover:bg-brand-400 hover:scale-[1.02] transition-all"
            >
              <MapPin className="h-4 w-4" />
              <span>Explore Live Map</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-all backdrop-blur-sm"
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              <span>Register a Charger</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics / Highlights */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-brand-600">100%</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">Free Open Access</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">GB/T &amp; CCS2</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">Multi-Standard Support</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">30+ kW to 180+ kW</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">Ultra-Fast DC Ready</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-electric-600">3 Districts</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">Gasabo, Kicukiro, Nyarugenge</div>
          </div>
        </div>
      </section>

      {/* Main Content & Mission */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 space-y-16">
        {/* Story & Context */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <Leaf className="h-3.5 w-3.5" />
              <span>Green Mobility Rwanda</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Why We Built EVchargers Kigali
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rwanda has established itself as an African leader in sustainability and green innovation. With national incentives encouraging electric cars, e-buses, and electric two-wheelers, EV adoption in Kigali is growing rapidly.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              However, drivers often face uncertainty: <em>Is this charger GB/T or CCS2? Is it 24/7 accessible? What is the pricing per kWh or session?</em> EVchargers bridges this gap with an intuitive, open map platform that gives drivers confidence to travel without range anxiety.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Our Core Pillars</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Precision Connector Data</h4>
                  <p className="text-xs text-slate-500">
                    Detailed filtering by socket standard (GB/T DC, CCS Type 2, Mennekes AC, CHAdeMO) so you never arrive with the wrong plug.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-electric-50 text-electric-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Operator &amp; Host Hub</h4>
                  <p className="text-xs text-slate-500">
                    Hotels, commercial plazas, and fleet operators can easily register, update power ratings, and maintain live status for their stations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Community Fault Reporting</h4>
                  <p className="text-xs text-slate-500">
                    Real-time crowd reports for ICEing (gas cars blocking charging bays), offline chargers, or broken connectors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kigali Supported Connector Guide */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Supported EV Charging Standards in Rwanda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Rwanda&apos;s vehicle landscape features both Asian-import and European/American electric vehicles. Here is what we map:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                  GB/T DC &amp; AC
                </span>
                <BatteryCharging className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Chinese Standard (GB/T)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Widely deployed across Kigali for BYD, Geely, NETA, and commercial electric fleets. Supports high-power DC fast charging from 30 kW up to 180 kW.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-electric-100 px-2 py-0.5 text-xs font-bold text-electric-800">
                  CCS Type 2 (Combo)
                </span>
                <Gauge className="h-5 w-5 text-electric-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">European Standard (CCS2)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard on European import EVs (Volkswagen ID series, Hyundai, Kia, BMW). Delivers high-speed direct current charging.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Type 2 (Mennekes) AC
                </span>
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Destination AC Charging</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard 7 kW to 22 kW AC stations located at hotels, malls, restaurants, and residential parking lots for overnight or long-stay top-ups.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-brand-950 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Are you a Station Host or Business Owner?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              List your charging facility on EVchargers Kigali to attract EV drivers, boost dwell time at your premises, and contribute to the country&apos;s sustainable transport grid.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-brand-400 transition-all"
            >
              <span>Add Station to Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 transition-all"
            >
              <span>Contact Team</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
