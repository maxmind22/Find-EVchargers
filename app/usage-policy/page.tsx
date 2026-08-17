import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, AlertTriangle, CheckCircle, Scale, ShieldAlert, Zap, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Usage Policy & Terms of Service | EVchargers Kigali',
  description:
    'Read the terms of use, driver etiquette guidelines, station host responsibilities, and disclaimers for the EVchargers Kigali platform.',
};

export default function UsagePolicyPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Header Banner */}
      <div className="bg-slate-900 px-4 py-12 sm:px-6 sm:py-16 text-white border-b border-slate-800">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Driver Map</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Usage Policy &amp; Terms</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Last Revised: August 17, 2026 • Governing Rules for EV Drivers &amp; Station Hosts in Rwanda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-10 text-slate-700">
        {/* Important Notice Callout */}
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Important Service &amp; Safety Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            EVchargers Kigali is an informational mapping and station directory platform. We do not directly operate the electrical power grids or third-party charging hardware. Drivers must always observe on-site safety instructions provided by station operators and equipment manufacturers.
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By visiting, downloading, or interacting with the EVchargers website or host portal, you agree to comply with and be bound by these Terms and Usage Policies. If you represent an organization or charging network, you represent that you have authority to bind that entity.
          </p>
        </section>

        {/* Section 2: Driver Conduct & Etiquette */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-600" />
            <span>2. EV Driver Etiquette &amp; Community Standards</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To keep Kigali&apos;s electric mobility network accessible and frictionless for everyone, all users agree to:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs sm:text-sm">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Prompt Bay Vacating
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Move your vehicle within 15 minutes of reaching your desired state of charge (or 80% on fast DC chargers during peak hours).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                No ICEing of Charging Bays
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Designated EV charging spots are strictly reserved for active charging. Never park an ICE (petrol/diesel) vehicle in an EV stall.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Accurate Fault Reporting
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Only submit genuine reports when a station is genuinely obstructed, broken, or mispriced to maintain system trust.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Cable Care &amp; Cleanliness
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Always hang cables securely on station holsters after use to prevent water ingress and ground damage.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Station Host Responsibilities */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">3. Station Host &amp; Operator Responsibilities</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Operators who register charging stations on EVchargers commit to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
            <li>Providing truthful, up-to-date information regarding connector speeds (kW), connector models (GB/T, CCS2, Mennekes), and access rules (Public, Hotel guests, Residential).</li>
            <li>Clearly disclosing tariff structures (RWF per kWh, session fee, or free access).</li>
            <li>Promptly updating station status to &quot;Maintenance&quot; or &quot;Offline&quot; during repairs or power outages.</li>
            <li>Ensuring all physical electrical installations adhere to Rwanda Energy Group (REG) and RURA electrical safety codes.</li>
          </ul>
        </section>

        {/* Section 4: Accuracy & Availability Disclaimer */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-4 w-4 text-brand-600" />
            <span>4. Warranty &amp; Real-Time Data Disclaimer</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The platform and its contents are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While we strive to maintain high data accuracy through community reports and operator updates, we cannot guarantee that every charger will be operational, unoccupied, or accessible at the exact moment of your arrival.
          </p>
        </section>

        {/* Section 5: Prohibited Activities */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>5. Prohibited Conduct</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Users are strictly prohibited from:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
            <li>Submitting false or malicious station locations, spamming community report tools, or defaming competing charging networks.</li>
            <li>Engaging in denial-of-service (DoS) attacks or automated scraping that impairs service performance for other drivers.</li>
            <li>Attempting unauthorized access to administrative APIs or station host accounts.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">6. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In no event shall EVchargers, its founders, or contributors be liable for any direct, indirect, incidental, or consequential damages resulting from vehicle towing, battery depletion, physical electrical faults, pricing disputes with third-party operators, or navigation delays.
          </p>
        </section>

        {/* Section 7: Governing Law */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">7. Governing Law &amp; Jurisdiction</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            These terms are governed by and construed under the laws of the Republic of Rwanda. Any legal disputes arising out of the use of this service shall be submitted to the competent courts of Kigali, Rwanda.
          </p>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
