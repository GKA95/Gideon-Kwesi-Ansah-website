import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Download, Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';

const NAV_ITEMS = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/research', label: 'Research' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout({
  children,
  isPreview = false,
}: {
  children: ReactNode;
  isPreview?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data } = usePortfolio();
  const settings = data?.settings;

  const brandName = settings?.siteName || 'Gideon Kwesi Ansah';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#060D1A] dark:text-slate-100 transition-colors duration-200">
      {isPreview && (
        <div className="bg-sky-700 text-white text-xs font-medium py-2 px-4 text-center">
          Draft Preview Mode — Unpublished edits are visible here only to you.
        </div>
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#060D1A]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-8">
          {/* Zone 1: Single-line brand mark */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap min-w-0 truncate focus-visible:outline-2 focus-visible:outline-sky-500 rounded-sm"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="h-7 w-7 rounded object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <span className="truncate">{brandName}</span>
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'border-sky-600 dark:border-sky-400 text-slate-900 dark:text-white'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Theme toggle + Primary CTA + mobile menu toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#0A192F] text-white hover:bg-[#112240] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Let&apos;s Work Together
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060D1A] px-4 py-4 space-y-1.5"
          >
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`
              }
            >
              Home
            </NavLink>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950"
              >
                Let&apos;s Work Together
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Public Footer — strictly zero admin links */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
            <div className="md:col-span-5">
              <p className="text-base font-display font-bold text-slate-900 dark:text-white">
                {settings?.profileName || 'Gideon Kwesi Ansah'}
              </p>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Building Digital Experiences, Creating AI-Powered Business Solutions, Turning Data
                into Insights, and Exploring Engineering Innovations.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {settings?.cvDocumentUrl ? (
                  <a
                    href={settings.cvDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={settings.cvFileName || 'Gideon_Kwesi_Ansah_CV.pdf'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download CV
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Request CV
                  </Link>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                Navigation
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    Home
                  </Link>
                </li>
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                Connect
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={settings?.githubUrl || 'https://github.com/GKA95'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href={(() => {
                      const url =
                        settings?.linkedinUrl ||
                        'https://www.linkedin.com/in/gideon-kwesi-ansah-066b55218';
                      return url.startsWith('http') ? url : `https://${url}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </li>
                {settings?.contactEmail ? (
                  <li>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                ) : null}
                {settings?.whatsappNumber ? (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      <span>WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ) : null}
                <li>
                  <Link
                    to="/contact"
                    className="text-sky-700 dark:text-sky-400 font-medium hover:underline"
                  >
                    Send a direct inquiry
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>
              {settings?.footerText ||
                '© 2026 Gideon Kwesi Ansah. Digital Solutions, Data Analytics, AI Automation & Electrical Engineering.'}
            </p>
            <p className="tabular-nums">BSc Electrical &amp; Electronic Engineering · KNUST</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
