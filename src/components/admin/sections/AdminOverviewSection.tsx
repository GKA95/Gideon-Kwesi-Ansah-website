import { useEffect, useState } from 'react';
import { apiFetch } from '../../../services/api';
import type { AdminActivityItem, SystemConfigStatus } from '../../../types/portfolio';
import { DatabaseConfigChecklist } from '../../../components/common/DatabaseConfigChecklist';

interface OverviewResponse {
  stats: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    archivedProjects: number;
    totalMessages: number;
    unreadMessages: number;
    totalServices: number;
    totalDocuments: number;
    totalTestimonials: number;
  };
  recentActivity: AdminActivityItem[];
  configStatus: SystemConfigStatus;
}

export function AdminOverviewSection({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch<OverviewResponse>('/api/admin/overview');
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load overview.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-5 text-sm text-rose-800 dark:text-rose-200">
        {error || 'Unable to load dashboard metrics.'}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: data.stats.totalProjects, tab: 'projects' },
    { label: 'Published Projects', value: data.stats.publishedProjects, tab: 'projects' },
    { label: 'Draft Projects', value: data.stats.draftProjects, tab: 'projects' },
    { label: 'Total Messages', value: data.stats.totalMessages, tab: 'messages' },
    { label: 'Unread Messages', value: data.stats.unreadMessages, tab: 'messages', highlight: data.stats.unreadMessages > 0 },
    { label: 'Active Services', value: data.stats.totalServices, tab: 'services' },
    { label: 'Uploaded Documents', value: data.stats.totalDocuments, tab: 'documents' },
    { label: 'Testimonials', value: data.stats.totalTestimonials, tab: 'testimonials' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigateTab(card.tab)}
            className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-5 hover:border-sky-500/60 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-display font-bold tabular-nums ${
                card.highlight
                  ? 'text-sky-700 dark:text-sky-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {card.value}
            </p>
          </button>
        ))}
      </div>

      <DatabaseConfigChecklist status={data.configStatus} dbConnected compact />

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
        <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white mb-4">
          Recent Admin Activity
        </h3>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recorded activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Action</th>
                  <th className="py-2.5 pr-4 font-medium">Summary</th>
                  <th className="py-2.5 pr-4 font-medium">Admin</th>
                  <th className="py-2.5 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.recentActivity.map((act) => (
                  <tr key={act._id}>
                    <td className="py-2.5 pr-4 font-mono text-xs text-sky-700 dark:text-sky-400">
                      {act.action}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-800 dark:text-slate-200">
                      {act.summary}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500 dark:text-slate-400">
                      {act.adminEmail}
                    </td>
                    <td className="py-2.5 text-right text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
