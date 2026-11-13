import { useEffect, useState, type FormEvent } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type { ProjectCategory, ServiceItem } from '../../../types/portfolio';
import { CloudinaryImageUploadField } from '../CloudinaryImageUploadField';

export function AdminServicesAiSection({ aiOnly = false }: { aiOnly?: boolean }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [capText, setCapText] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await apiFetch<{ services: ServiceItem[] }>('/api/admin/services');
    setServices(res.services || []);
  }

  useEffect(() => {
    void load();
  }, []);

  function openNewAi() {
    setEditing({
      title: '',
      shortSummary: '',
      description: '',
      capabilities: [],
      category: 'AI Automation',
      visualUrl: '',
      order: services.length + 1,
      isPublished: false,
      isAiAutomation: true,
      aiProblemSolved: '',
      aiDemoUrl: '',
      aiCaseStudy: '',
      aiResults: '',
    });
    setCapText('');
  }

  function openEdit(svc: ServiceItem) {
    setEditing({ ...svc });
    setCapText((svc.capabilities || []).join('\n'));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        capabilities: capText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing._id) {
        await apiFetch(`/api/admin/services/${editing._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function removeService(id: string) {
    await apiFetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    await load();
  }

  const list = aiOnly ? services.filter((s) => s.isAiAutomation || s.category === 'AI Automation') : services;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            {aiOnly ? 'AI Automation & Business Solutions' : 'Services & AI Automation'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage service descriptions, capabilities, AI business solutions, demo links, and case
            studies.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewAi}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service / AI Solution</span>
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-display font-bold">
              {editing._id ? `Edit: ${editing.title}` : 'New Service / AI Solution'}
            </h3>
            <button type="button" onClick={() => setEditing(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">Title</label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={editing.category || 'AI Automation'}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value as ProjectCategory })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              >
                <option value="Website Development">Website Development</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="AI Automation">AI Automation</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Capabilities (one per line)</label>
            <textarea
              rows={4}
              value={capText}
              onChange={(e) => setCapText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.isPublished)}
                onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
              />
              <span>Published on Public Site</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.isAiAutomation)}
                onChange={(e) => setEditing({ ...editing, isAiAutomation: e.target.checked })}
              />
              <span>AI Automation Solution</span>
            </label>
          </div>

          {editing.isAiAutomation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold mb-1">Business Problem Solved</label>
                <textarea
                  rows={2}
                  value={editing.aiProblemSolved || ''}
                  onChange={(e) => setEditing({ ...editing, aiProblemSolved: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Demo Video / Live Link</label>
                <input
                  type="url"
                  value={editing.aiDemoUrl || ''}
                  onChange={(e) => setEditing({ ...editing, aiDemoUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1">Case Study &amp; Results</label>
                <textarea
                  rows={2}
                  value={editing.aiCaseStudy || ''}
                  onChange={(e) => setEditing({ ...editing, aiCaseStudy: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <CloudinaryImageUploadField
            label="Service / Solution Visual"
            value={editing.visualUrl || ''}
            onChange={(url) => setEditing({ ...editing, visualUrl: url })}
            folder="services"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((svc) => (
          <div
            key={svc._id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  {svc.category} · {svc.isPublished ? 'Published' : 'Draft'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(svc)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600"
                    aria-label={`Edit ${svc.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeService(svc._id)}
                    className="p-1.5 text-rose-600 hover:text-rose-700"
                    aria-label={`Delete ${svc.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-1 text-base font-display font-bold text-slate-900 dark:text-white">
                {svc.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {svc.description}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {svc.capabilities?.length || 0} capabilities listed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
