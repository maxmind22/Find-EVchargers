'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Building,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Footer } from '@/components/Footer';

const FAQ_ITEMS = [
  {
    question: 'How do I register my EV charger on the Kigali map?',
    answer:
      'You can register your charger directly through our Station Host Portal. Simply sign in with your email, click "Add Station", and specify your location coordinates, connector types (GB/T, CCS2, Type 2), power output (kW), access rules, and pricing.',
  },
  {
    question: 'Why do some Kigali charging stations have GB/T vs CCS2 connectors?',
    answer:
      'Rwanda has a diverse fleet of electric vehicles. Many popular vehicles (such as BYD, NETA, and commercial electric vans) use the Chinese GB/T standard, while European imports (VW ID series, Hyundai, Kia) use CCS Type 2. Our map lets you filter specifically for the plug standard compatible with your vehicle.',
  },
  {
    question: 'How do I report a broken station or an ICE vehicle blocking a charger?',
    answer:
      'When viewing any station on the Driver Map, tap the "Report Issue" button in the station details drawer. Select the issue type (Broken Connector, Blocked by ICE Vehicle, Offline, Wrong Pricing) and submit a report to alert fellow drivers.',
  },
  {
    question: 'Is EVchargers free to use for drivers and station hosts?',
    answer:
      'Yes, EVchargers Kigali is 100% free and open. Drivers can search and filter charging points without subscriptions, and hosts can list their stations at zero charge.',
  },
  {
    question: 'Do you provide an API for commercial EV fleets or taxi cooperatives?',
    answer:
      'Yes! We offer integrations and data feeds for fleet operators and mobility startups in Rwanda. Please select "Partnership / Fleet" in the contact form to discuss API access.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Support',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmissionSuccess(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissionSuccess(data.ticketId || 'EV-SUBMITTED');
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'General Support',
          message: '',
        });
      } else {
        setErrorMessage(data.error || 'Failed to submit your message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Header Banner */}
      <div className="bg-slate-900 px-4 py-12 sm:px-6 sm:py-16 text-white border-b border-slate-800">
        <div className="mx-auto max-w-5xl space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Driver Map</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Contact Us &amp; Support</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Have a question, station correction, or partnership inquiry? We&apos;re here to help.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Info */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Contact Cards & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Get in Touch</h2>
              <p className="mt-1 text-xs text-slate-500">
                Our support team is based in Kigali, supporting EV drivers and station hosts across Rwanda.
              </p>
            </div>

            {/* Support Channels */}
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Email Inquiries</h4>
                  <a
                    href="mailto:support@evchargers.rw"
                    className="text-xs font-medium text-brand-600 hover:underline block"
                  >
                    support@evchargers.rw
                  </a>
                  <span className="text-[10px] text-slate-400">Average response time: &lt; 2 hours</span>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-electric-50 text-electric-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Driver Hotline &amp; WhatsApp</h4>
                  <p className="text-xs font-semibold text-slate-800">+250 788 123 456</p>
                  <span className="text-[10px] text-slate-400">Available 24/7 for charging emergencies</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kigali Operations Hub</h4>
                  <p className="text-xs text-slate-600">Kigali Innovation City, Gasabo District</p>
                  <p className="text-[10px] text-slate-400">Kigali, Rwanda</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Host Support Desk</h4>
                  <p className="text-xs text-slate-600">Monday – Friday: 8:00 AM – 6:00 PM CAT</p>
                  <span className="text-[10px] text-slate-400">Weekends: Online Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Send us a Message</h2>
              <p className="mt-1 text-xs text-slate-500">
                Fill out the form below and we will respond as soon as possible.
              </p>

              {submissionSuccess ? (
                <div className="mt-6 rounded-2xl bg-brand-50 p-6 border border-brand-200 text-center space-y-4 animate-in fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-brand-950">Message Sent Successfully!</h3>
                    <p className="text-xs text-brand-800">
                      Thank you for reaching out. We have logged your request under reference ticket:
                    </p>
                    <div className="inline-block rounded-lg bg-white px-3 py-1 font-mono text-xs font-bold text-brand-700 shadow-sm border border-brand-200">
                      {submissionSuccess}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmissionSuccess(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {errorMessage && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eric Manzi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+250 78..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      <option value="General Support">General EV Driver Support</option>
                      <option value="Host Registration">Station Host Registration / Listing Help</option>
                      <option value="Data Correction">Station Data Correction or Fault Report</option>
                      <option value="Partnership / Fleet">Commercial Fleet &amp; Corporate Partnership</option>
                      <option value="Technical Feedback">Technical Feedback &amp; Suggestions</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe your question or station details in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/25 hover:bg-brand-400 disabled:opacity-50 transition-all active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700">
              <HelpCircle className="h-3.5 w-3.5 text-brand-600" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Quick answers about charging specs, station listing, and Rwanda&apos;s EV standards.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
