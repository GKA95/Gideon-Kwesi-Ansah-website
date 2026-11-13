import { useEffect, useState, type FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type { SiteSettings, TestimonialItem } from '../../../types/portfolio';
import { CloudinaryImageUploadField } from '../CloudinaryImageUploadField';

export function AdminTestimonialsSection() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [personName, setPersonName] = useState('');
  const [positionOrOrg, setPositionOrOrg] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  async function load() {
    const res = await apiFetch<{ testimonials: TestimonialItem[] }>('/api/admin/testimonials');
    setItems(res.testimonials || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiFetch('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        personName,
        positionOrOrg,
        content,
        photoUrl,
        isPublished,
        order: items.length + 1,
      }),
    });
    setPersonName('');
    setPositionOrOrg('');
    setContent('');
    setPhotoUrl('');
    await load();
  }

  async function togglePublish(t: TestimonialItem) {
    await apiFetch(`/api/admin/testimonials/${t._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...t, isPublished: !t.isPublished }),
    });
    await load();
  }

  async function remove(id: string) {
    await apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-4"
      >
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
          Add Genuine Testimonial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Person&apos;s Name</label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Position or Organisation</label>
            <input
              type="text"
              required
              value={positionOrOrg}
              onChange={(e) => setPositionOrOrg(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Testimonial</label>
          <textarea
            rows={3}
            required
            minLength={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <CloudinaryImageUploadField
          label="Profile Photograph (Optional)"
          value={photoUrl}
          onChange={setPhotoUrl}
          folder="testimonials"
        />
        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span>Publish on public homepage</span>
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] divide-y divide-slate-200 dark:divide-slate-800">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No testimonials added yet. Genuine client or academic recommendations added here will
            appear on the public website once published.
          </div>
        ) : (
          items.map((t) => (
            <div key={t._id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t.personName} ·{' '}
                  <span className="font-normal text-slate-500">{t.positionOrOrg}</span>
                </p>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{t.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void togglePublish(t)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                >
                  {t.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(t._id)}
                  className="p-1.5 text-rose-600"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminSettingsSection() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<{ settings: SiteSettings }>('/api/admin/settings');
      setForm(res.settings);
    }
    void load();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setFeedback('Website settings, contact details, and SEO settings saved.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <div className="text-sm text-slate-500">Loading settings...</div>;

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-6"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Website Settings, Profile Photo, Contact &amp; SEO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes update the live public website immediately upon saving.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {feedback ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Website Name</label>
          <input
            type="text"
            required
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Profile Name</label>
          <input
            type="text"
            required
            value={form.profileName}
            onChange={(e) => setForm({ ...form, profileName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CloudinaryImageUploadField
          label="Profile Photograph (Hero & About)"
          value={form.profilePhotoUrl}
          onChange={(url) => setForm({ ...form, profilePhotoUrl: url })}
          folder="profile"
          helperText="Upload your real portrait photograph via Cloudinary."
        />
        <CloudinaryImageUploadField
          label="Website Logo (Optional)"
          value={form.logoUrl}
          onChange={(url) => setForm({ ...form, logoUrl: url })}
          folder="branding"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Contact Email</label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">WhatsApp Number</label>
          <input
            type="text"
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            placeholder="+233..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedinUrl}
            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">GitHub URL</label>
          <input
            type="url"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          SEO &amp; Social Sharing Settings
        </h3>
        <div>
          <label className="block text-xs font-semibold mb-1.5">SEO Title</label>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">SEO Description</label>
          <textarea
            rows={2}
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <CloudinaryImageUploadField
          label="Social-Sharing Image (OpenGraph)"
          value={form.socialImageUrl}
          onChange={(url) => setForm({ ...form, socialImageUrl: url })}
          folder="seo"
        />
        <div>
          <label className="block text-xs font-semibold mb-1.5">Footer Text</label>
          <input
            type="text"
            value={form.footerText}
            onChange={(e) => setForm({ ...form, footerText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>
    </form>
  );
}
