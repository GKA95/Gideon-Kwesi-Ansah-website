import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Mail, MessageSquare, Send } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { apiFetch } from '../../services/api';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';

const SERVICE_OPTIONS = [
  'Website Development',
  'Data Analytics',
  'AI Automation',
  'Electrical Engineering',
  'Research Collaboration',
  'Other',
] as const;

export function ContactPage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service');
  const settings = data?.settings;

  const matchedService = SERVICE_OPTIONS.includes(
    initialService as (typeof SERVICE_OPTIONS)[number]
  )
    ? (initialService as (typeof SERVICE_OPTIONS)[number])
    : 'Website Development';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState<string>(matchedService);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await apiFetch<{ success: boolean; message: string }>('/api/public/contact', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          organisation,
          serviceOfInterest,
          message,
        }),
      });
      setSubmitSuccess(res.message || 'Thank you. Your message has been received.');
      setFullName('');
      setEmail('');
      setOrganisation('');
      setMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicStateGuard>
      <SeoHead
        title={`Contact — ${settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description="Get in touch with Gideon Kwesi Ansah regarding website development, data analytics, AI automation, or electrical engineering collaborations."
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
      />

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Contact</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            Let&apos;s Work Together
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Share details about your project, business automation idea, data analysis requirement,
            or research collaboration. Messages go directly into my private inbox.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 sm:p-10">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Send a Message
            </h2>

            {submitSuccess ? (
              <div
                role="status"
                className="mt-6 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/40 p-5 flex items-start gap-3 text-emerald-900 dark:text-emerald-200"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Message Received</p>
                  <p className="mt-1 text-sm">{submitSuccess}</p>
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-rose-300 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-900 dark:text-rose-200"
              >
                {submitError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-fullName"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-org"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Organisation (Optional)
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    placeholder="Company or institution"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-service"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Service of Interest
                  </label>
                  <select
                    id="contact-service"
                    value={serviceOfInterest}
                    onChange={(e) => setServiceOfInterest(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project goals, timeline, or questions..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Direct Channels & Social Links */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                Direct Channels &amp; Profiles
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Connect via verified channels below or submit an inquiry using the form.
              </p>

              <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                <div className="py-3.5">
                  <a
                    href={settings?.githubUrl || 'https://github.com/GKA95'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                <div className="py-3.5">
                  {(() => {
                    const rawLinkedin =
                      settings?.linkedinUrl ||
                      'https://www.linkedin.com/in/gideon-kwesi-ansah-066b55218';
                    const linkedinHref = rawLinkedin.startsWith('http')
                      ? rawLinkedin
                      : `https://${rawLinkedin}`;
                    return (
                      <a
                        href={linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        <span>LinkedIn</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    );
                  })()}
                </div>

                {settings?.contactEmail ? (
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                ) : null}

                {settings?.whatsappNumber ? (
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </span>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400"
                    >
                      <span>{settings.whatsappNumber}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicStateGuard>
  );
}
