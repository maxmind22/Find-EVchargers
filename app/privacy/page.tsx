import Link from 'next/link';
import { Metadata } from 'next';
import { Shield, Lock, Eye, MapPin, Database, UserCheck, Mail, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | EVchargers Kigali',
  description:
    'Our Privacy Policy explains how EVchargers Kigali collects, uses, and protects your location and personal data under Rwanda Law No 058/2021.',
};

export default function PrivacyPolicyPage() {
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
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Effective Date: August 17, 2026 • Compliant with Rwanda Law N° 058/2021 on Personal Data Protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-10 text-slate-700">
        {/* Quick Summary Highlights */}
        <div className="rounded-3xl border border-brand-200/80 bg-brand-50/60 p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-brand-700" />
            <span>Summary of Key Principles</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-brand-900 leading-relaxed list-disc list-inside">
            <li>We do not sell your personal or location data to advertisers or third-party brokers.</li>
            <li>GPS location permissions are used strictly in real-time to compute distances to nearby charging stations in Kigali.</li>
            <li>Station hosts and operators control their public charger listings and can modify or remove their info at any time.</li>
            <li>We adhere to national data protection regulations under the Republic of Rwanda&apos;s National Cyber Security Authority (NCSA).</li>
          </ul>
        </div>

        {/* Section 1: Introduction */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">1. Introduction &amp; Scope</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Welcome to EVchargers Kigali (&quot;EVchargers&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). This Privacy Policy governs the processing of personal data collected when you use our interactive map website, operator portal, and related services (collectively, the &quot;Platform&quot;).
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By accessing or using EVchargers, you acknowledge and agree to the collection and handling of your information as described in this policy. If you do not agree, please do not use our services.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
          
          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>A. Geolocation Data</span>
              </h3>
              <p className="mt-1 leading-relaxed">
                When you grant browser location permissions (GPS / IP-based location), our system uses your approximate or exact coordinates to center the map and calculate distance to nearby EV charging points. This location request happens on your device and is not retained on our servers as persistent location history.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Database className="h-4 w-4 text-electric-600" />
                <span>B. Operator Account Data</span>
              </h3>
              <p className="mt-1 leading-relaxed">
                When you sign up as a Station Host or Administrator, we collect your name, email address, password hash, and the metadata of the charging stations you manage (such as location name, coordinates, power in kW, socket types, pricing, and amenities).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-600" />
                <span>C. Community Station Reports &amp; Inquiries</span>
              </h3>
              <p className="mt-1 leading-relaxed">
                If you submit a station issue report (e.g. Broken Connector, ICE vehicle blocking bay) or contact us via our support form, we collect the timestamp, station identifier, category, and any descriptive comments you submit.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                <span>D. Device, Log &amp; Cookie Information</span>
              </h3>
              <p className="mt-1 leading-relaxed">
                We store essential local preferences (such as your active connector filter selections or map center position) using local browser storage. We may log standard HTTP request metadata (IP address, browser type, referring URLs) for cybersecurity and rate limiting.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Your Information */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">3. How We Use Your Information</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
            <li>Display nearby charging stations, filter by connector type, and calculate travel routes.</li>
            <li>Authenticate Station Hosts and allow them to manage, edit, or remove their charger listings.</li>
            <li>Maintain data integrity, verify new charging points, and resolve reported station defects.</li>
            <li>Respond to your technical inquiries, feedback, and customer support tickets.</li>
            <li>Comply with regulatory requirements established by Rwandan transport and energy regulatory bodies (e.g. RURA).</li>
          </ul>
        </section>

        {/* Section 4: Data Security & Storage */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">4. Data Security &amp; Storage</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We employ modern encryption protocols (TLS/HTTPS in transit, encrypted databases at rest) and strict role-based access control. While no internet-based service is 100% immune to vulnerabilities, we continually review our infrastructure to prevent unauthorized access, loss, or alteration.
          </p>
        </section>

        {/* Section 5: Your Rights under Rwanda Law */}
        <section className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">5. Your Rights Under Rwanda Data Protection Law</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In accordance with Law N° 058/2021 of 13/10/2021 relating to the protection of personal data and privacy in Rwanda, you have the right to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
            <li>Request access to the personal data we hold about you.</li>
            <li>Request rectification of inaccurate or outdated information.</li>
            <li>Request erasure of your account or registered station listings.</li>
            <li>Withdraw consent to location permissions at any time via your browser settings.</li>
            <li>Lodge a complaint with the National Cyber Security Authority (NCSA) or data protection regulator.</li>
          </ul>
        </section>

        {/* Section 6: Contact Us */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-600" />
            <span>6. Contact our Privacy Team</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise any of your data protection rights, please reach out to us:
          </p>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">EVchargers Data Protection Officer</p>
            <p>Email: <a href="mailto:privacy@evchargers.rw" className="text-brand-600 font-semibold hover:underline">privacy@evchargers.rw</a></p>
            <p>Address: Kigali Innovation District, Gasabo, Kigali, Rwanda</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
