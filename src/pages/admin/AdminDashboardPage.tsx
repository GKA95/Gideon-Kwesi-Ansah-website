import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  Bot,
  FolderKanban,
  BookOpen,
  FileText,
  Inbox,
  MessageSquareQuote,
  Settings,
  Eye,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { apiFetch, setCsrfToken } from '../../services/api';
import type { AdminUser } from '../../types/portfolio';
import { useTheme } from '../../context/ThemeContext';
import { SeoHead } from '../../components/common/SeoHead';
import { AdminOverviewSection } from '../../components/admin/sections/AdminOverviewSection';
import {
  AdminAboutEditor,
  AdminHomepageEditor,
  AdminResearchAndSkillsEditor,
} from '../../components/admin/sections/AdminContentEditors';
import { AdminProjectsSection } from '../../components/admin/sections/AdminProjectsSection';
import { AdminServicesAiSection } from '../../components/admin/sections/AdminServicesAiSection';
import { AdminInboxSection } from '../../components/admin/sections/AdminInboxSection';
import { AdminDocumentsSection } from '../../components/admin/sections/AdminDocumentsSection';
import {
  AdminSettingsSection,
  AdminTestimonialsSection,
} from '../../components/admin/sections/AdminTestimonialsAndSettingsSection';
import { AdminPreviewModal } from '../../components/admin/sections/AdminPreviewModal';

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'homepage', label: 'Homepage & Hero', icon: Home },
  { id: 'about', label: 'About & Education', icon: User },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'ai-automation', label: 'AI Automation', icon: Bot },
  { id: 'research', label: 'Research & Skills', icon: BookOpen },
  { id: 'documents', label: 'CV & Documents', icon: FileText },
  { id: 'messages', label: 'Contact Inbox', icon: Inbox },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'settings', label: 'Website & SEO', icon: Settings },
] as const;

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await apiFetch<{ admin: AdminUser; csrfToken: string }>('/api/admin/me');
        setCsrfToken(res.csrfToken);
        setAdmin(res.admin);
      } catch {
        navigate('/admin/login', { replace: true });
      } finally {
        setCheckingAuth(false);
      }
    }
    void verifySession();
  }, [navigate]);

  async function handleLogout() {
    try {
      await apiFetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setCsrfToken('');
      navigate('/admin/login', { replace: true });
    }
  }

  if (checkingAuth || !admin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060D1A] flex items-center justify-center text-sm text-slate-500">
        <SeoHead title="Admin Dashboard" description="Private admin console" noindex />
        Verifying administrator session...
      </div>
    );
  }

  const currentSection = NAV_SECTIONS.find((s) => s.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 flex">
      <SeoHead
        title={`${currentSection?.label || 'Dashboard'} — Admin`}
        description="Private portfolio administration dashboard."
        noindex
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121] flex flex-col transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-display font-bold text-slate-900 dark:text-white">
              GKA Admin CMS
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[175px]">
              {admin.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const active = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveTab(sec.id);
                  setSidebarOpen(false);
                }}
                className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#0A192F] text-white dark:bg-sky-500/15 dark:text-sky-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <span>Open Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              <span className="hidden sm:inline">Admin / </span>
              <span className="text-slate-900 dark:text-white font-semibold truncate">
                {currentSection?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 sm:px-3.5 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="sm:hidden">Preview</span>
              <span className="hidden sm:inline">Preview Draft Site</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewSection onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'homepage' && (
            <AdminHomepageEditor onOpenPreview={() => setShowPreview(true)} />
          )}
          {activeTab === 'about' && (
            <AdminAboutEditor onOpenPreview={() => setShowPreview(true)} />
          )}
          {activeTab === 'projects' && <AdminProjectsSection />}
          {activeTab === 'services' && <AdminServicesAiSection />}
          {activeTab === 'ai-automation' && <AdminServicesAiSection aiOnly />}
          {activeTab === 'research' && <AdminResearchAndSkillsEditor />}
          {activeTab === 'documents' && <AdminDocumentsSection />}
          {activeTab === 'messages' && <AdminInboxSection />}
          {activeTab === 'testimonials' && <AdminTestimonialsSection />}
          {activeTab === 'settings' && <AdminSettingsSection />}
        </main>
      </div>

      {showPreview ? <AdminPreviewModal onClose={() => setShowPreview(false)} /> : null}
    </div>
  );
}
