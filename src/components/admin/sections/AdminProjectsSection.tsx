import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type { ProjectCategory, ProjectItem, ProjectStatus } from '../../../types/portfolio';
import { CloudinaryImageUploadField } from '../CloudinaryImageUploadField';

const EMPTY_PROJECT: Omit<ProjectItem, '_id'> = {
  title: '',
  slug: '',
  category: 'Website Development',
  shortDescription: '',
  overview: '',
  problemStatement: '',
  objectives: [],
  contribution: '',
  technologies: [],
  developmentProcess: '',
  resultsAndFindings: '',
  coverImageUrl: '',
  galleryImages: [],
  githubUrl: '',
  liveDemoUrl: '',
  demoVideoUrl: '',
  businessProblemSolved: '',
  caseStudyDetails: '',
  featured: false,
  order: 0,
  status: 'draft',
};

export function AdminProjectsSection({ defaultFilter = 'all' }: { defaultFilter?: string }) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultFilter);
  const [editing, setEditing] = useState<Partial<ProjectItem> | null>(null);
  const [techInput, setTechInput] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await apiFetch<{ projects: ProjectItem[] }>('/api/admin/projects');
      setProjects(res.projects || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  function openNew() {
    setEditing({ ...EMPTY_PROJECT, order: projects.length + 1 });
    setTechInput('');
    setObjectivesText('');
    setError(null);
  }

  function openEdit(proj: ProjectItem) {
    setEditing({ ...proj });
    setTechInput((proj.technologies || []).join(', '));
    setObjectivesText((proj.objectives || []).join('\n'));
    setError(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);

    const payload = {
      ...editing,
      technologies: techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      objectives: objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editing._id) {
        await apiFetch(`/api/admin/projects/${editing._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: ProjectStatus) {
    await apiFetch(`/api/admin/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadProjects();
  }

  async function toggleFeatured(proj: ProjectItem) {
    await apiFetch(`/api/admin/projects/${proj._id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ featured: !proj.featured }),
    });
    await loadProjects();
  }

  async function deleteProject(id: string) {
    await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    await loadProjects();
  }

  async function moveOrder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const copy = [...projects];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setProjects(copy);
    await apiFetch('/api/admin/projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds: copy.map((p) => p._id) }),
    });
  }

  const filtered = projects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'ai') return p.category === 'AI Automation';
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0D1B2E] border border-slate-200 dark:border-slate-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'archived', label: 'Archived' },
            { id: 'ai', label: 'AI Automation' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                filter === tab.id
                  ? 'bg-white dark:bg-[#0A192F] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-display font-bold">
              {editing._id ? `Edit: ${editing.title}` : 'New Project'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">Project Title</label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Category</label>
              <select
                value={editing.category || 'Website Development'}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">URL Slug (optional)</label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Publication Status</label>
              <select
                value={editing.status || 'draft'}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as ProjectStatus })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Live)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span>Feature on Homepage</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Short Card Description</label>
            <textarea
              rows={2}
              required
              value={editing.shortDescription || ''}
              onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Project Overview</label>
            <textarea
              rows={3}
              value={editing.overview || ''}
              onChange={(e) => setEditing({ ...editing, overview: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Problem Statement</label>
              <textarea
                rows={3}
                value={editing.problemStatement || ''}
                onChange={(e) => setEditing({ ...editing, problemStatement: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Objectives (one per line)
              </label>
              <textarea
                rows={3}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">My Contribution</label>
              <textarea
                rows={3}
                value={editing.contribution || ''}
                onChange={(e) => setEditing({ ...editing, contribution: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Development Process</label>
              <textarea
                rows={3}
                value={editing.developmentProcess || ''}
                onChange={(e) => setEditing({ ...editing, developmentProcess: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Results &amp; Findings</label>
              <textarea
                rows={3}
                value={editing.resultsAndFindings || ''}
                onChange={(e) => setEditing({ ...editing, resultsAndFindings: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Technologies &amp; Tools (comma separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Python, Pandas, Scikit-learn, MATLAB"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
              {editing.category === 'AI Automation' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold mb-1.5">
                    Business Problem Solved (AI Automation)
                  </label>
                  <input
                    type="text"
                    value={editing.businessProblemSolved || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, businessProblemSolved: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">GitHub Repository URL</label>
              <input
                type="url"
                value={editing.githubUrl || ''}
                onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Live Demonstration URL</label>
              <input
                type="url"
                value={editing.liveDemoUrl || ''}
                onChange={(e) => setEditing({ ...editing, liveDemoUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Demo Video URL (Optional)</label>
              <input
                type="url"
                value={editing.demoVideoUrl || ''}
                onChange={(e) => setEditing({ ...editing, demoVideoUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <CloudinaryImageUploadField
            label="Cover Image"
            value={editing.coverImageUrl || ''}
            onChange={(url) => setEditing({ ...editing, coverImageUrl: url })}
            folder="projects"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Project Gallery Screenshots</label>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    galleryImages: [...(editing.galleryImages || []), ''],
                  })
                }
                className="text-xs font-semibold text-sky-700 dark:text-sky-400"
              >
                + Add Gallery Slot
              </button>
            </div>
            {(editing.galleryImages || []).map((img, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-1">
                  <CloudinaryImageUploadField
                    label={`Screenshot ${idx + 1}`}
                    value={img}
                    onChange={(url) => {
                      const next = [...(editing.galleryImages || [])];
                      next[idx] = url;
                      setEditing({ ...editing, galleryImages: next });
                    }}
                    folder="projects/gallery"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = (editing.galleryImages || []).filter((_, i) => i !== idx);
                    setEditing({ ...editing, galleryImages: next });
                  }}
                  className="mt-6 text-rose-600 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
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
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No projects match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-medium">Order</th>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Featured</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((proj, idx) => (
                  <tr key={proj._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={filter !== 'all' || idx === 0}
                          onClick={() => void moveOrder(idx, -1)}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={filter !== 'all' || idx === filtered.length - 1}
                          onClick={() => void moveOrder(idx, 1)}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{proj.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {proj.shortDescription}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {proj.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={proj.status}
                        onChange={(e) =>
                          void updateStatus(proj._id, e.target.value as ProjectStatus)
                        }
                        className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => void toggleFeatured(proj)}
                        aria-label="Toggle featured"
                        className={`p-1.5 rounded ${
                          proj.featured
                            ? 'text-amber-500'
                            : 'text-slate-300 dark:text-slate-700 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(proj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProject(proj._id)}
                          className="p-1.5 text-rose-600 hover:text-rose-700"
                          aria-label={`Delete ${proj.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
