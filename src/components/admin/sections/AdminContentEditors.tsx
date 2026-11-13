import { useEffect, useState, type FormEvent } from 'react';
import { Eye, Plus, Trash2, Check } from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type {
  AboutContent,
  HomepageContent,
  ResearchContent,
  ResearchInterestItem,
  SkillItem,
} from '../../../types/portfolio';

export function AdminHomepageEditor({ onOpenPreview }: { onOpenPreview: () => void }) {
  const [form, setForm] = useState<HomepageContent | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<{
        homepage: { isPublished: boolean; draft: HomepageContent; published: HomepageContent };
      }>('/api/admin/homepage');
      setForm(res.homepage?.draft || res.homepage?.published);
      setIsPublished(Boolean(res.homepage?.isPublished));
    }
    void load();
  }, []);

  async function save(action: 'save_draft' | 'publish' | 'unpublish') {
    if (!form) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiFetch<{ homepage: { isPublished: boolean } }>('/api/admin/homepage', {
        method: 'PUT',
        body: JSON.stringify({ action, data: form }),
      });
      setIsPublished(res.homepage.isPublished);
      setFeedback(
        action === 'publish'
          ? 'Homepage changes published to the live website.'
          : action === 'unpublish'
          ? 'Homepage unpublished.'
          : 'Draft saved.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <div className="text-sm text-slate-500">Loading homepage content...</div>;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Homepage &amp; Hero Content
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Status: {isPublished ? 'Published Live' : 'Unpublished'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Draft</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('save_draft')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('publish')}
            className="px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
          >
            Publish Live
          </button>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Hero Display Name</label>
          <input
            type="text"
            value={form.heroName}
            onChange={(e) => setForm({ ...form, heroName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Expertise Section Title</label>
          <input
            type="text"
            value={form.expertiseSectionTitle}
            onChange={(e) => setForm({ ...form, expertiseSectionTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Main Hero Headline</label>
        <textarea
          rows={2}
          value={form.heroHeadline}
          onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Supporting Hero Description</label>
        <textarea
          rows={3}
          value={form.heroSubheadline}
          onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Primary Button Text</label>
          <input
            type="text"
            value={form.primaryCtaText}
            onChange={(e) => setForm({ ...form, primaryCtaText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Secondary Button Text</label>
          <input
            type="text"
            value={form.secondaryCtaText}
            onChange={(e) => setForm({ ...form, secondaryCtaText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Short Introduction Title</label>
        <input
          type="text"
          value={form.shortIntroTitle}
          onChange={(e) => setForm({ ...form, shortIntroTitle: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Short Introduction Body</label>
        <textarea
          rows={3}
          value={form.shortIntroBody}
          onChange={(e) => setForm({ ...form, shortIntroBody: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Featured Projects Title</label>
          <input
            type="text"
            value={form.featuredSectionTitle}
            onChange={(e) => setForm({ ...form, featuredSectionTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Featured Projects Subtitle</label>
          <input
            type="text"
            value={form.featuredSectionSubtitle}
            onChange={(e) => setForm({ ...form, featuredSectionSubtitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Bottom CTA Heading</label>
          <input
            type="text"
            value={form.ctaTitle}
            onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Bottom CTA Button Label</label>
          <input
            type="text"
            value={form.ctaButtonText}
            onChange={(e) => setForm({ ...form, ctaButtonText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Bottom CTA Description</label>
        <textarea
          rows={2}
          value={form.ctaBody}
          onChange={(e) => setForm({ ...form, ctaBody: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

export function AdminAboutEditor({ onOpenPreview }: { onOpenPreview: () => void }) {
  const [form, setForm] = useState<AboutContent | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<{
        about: { isPublished: boolean; draft: AboutContent; published: AboutContent };
      }>('/api/admin/about');
      setForm(res.about?.draft || res.about?.published);
      setIsPublished(Boolean(res.about?.isPublished));
    }
    void load();
  }, []);

  async function save(action: 'save_draft' | 'publish') {
    if (!form) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiFetch<{ about: { isPublished: boolean } }>('/api/admin/about', {
        method: 'PUT',
        body: JSON.stringify({ action, data: form }),
      });
      setIsPublished(res.about.isPublished);
      setFeedback(action === 'publish' ? 'About page published live.' : 'Draft saved.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <div className="text-sm text-slate-500">Loading About content...</div>;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            About Me &amp; Education
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Status: {isPublished ? 'Published Live' : 'Draft Only'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('save_draft')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('publish')}
            className="px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
          >
            Publish Live
          </button>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Full Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Degree</label>
          <input
            type="text"
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">University</label>
          <input
            type="text"
            value={form.university}
            onChange={(e) => setForm({ ...form, university: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Graduation Year</label>
            <input
              type="text"
              value={form.graduationYear}
              onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Honors</label>
            <input
              type="text"
              value={form.honors}
              onChange={(e) => setForm({ ...form, honors: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {[
        { key: 'professionalBackground', label: 'Professional Background' },
        { key: 'educationDetails', label: 'Education' },
        { key: 'technicalInterests', label: 'Technical Interests' },
        { key: 'professionalApproach', label: 'Professional Approach' },
        { key: 'careerAndResearchInterests', label: 'Career and Research Interests' },
      ].map((field) => (
        <div key={field.key}>
          <label className="block text-xs font-semibold mb-1.5">{field.label}</label>
          <textarea
            rows={3}
            value={form[field.key as keyof AboutContent]}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export function AdminResearchAndSkillsEditor() {
  const [research, setResearch] = useState<ResearchContent | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState<SkillItem['category']>('Website Development');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadAll() {
    const [rRes, sRes] = await Promise.all([
      apiFetch<{ research: { draft: ResearchContent; published: ResearchContent } }>('/api/admin/research'),
      apiFetch<{ skills: SkillItem[] }>('/api/admin/skills'),
    ]);
    setResearch(rRes.research?.draft || rRes.research?.published);
    setSkills(sRes.skills || []);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function saveResearch(action: 'save_draft' | 'publish') {
    if (!research) return;
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch('/api/admin/research', {
        method: 'PUT',
        body: JSON.stringify({ action, data: research }),
      });
      setFeedback(action === 'publish' ? 'Research content published live.' : 'Research draft saved.');
    } finally {
      setSaving(false);
    }
  }

  async function addSkill(e: FormEvent) {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const res = await apiFetch<{ skill: SkillItem }>('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify({
        name: newSkillName.trim(),
        category: newSkillCat,
        order: skills.length + 1,
        isPublished: true,
      }),
    });
    setSkills((prev) => [...prev, res.skill]);
    setNewSkillName('');
  }

  async function deleteSkill(id: string) {
    await apiFetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
    setSkills((prev) => prev.filter((s) => s._id !== id));
  }

  function addInterest() {
    if (!research) return;
    const next: ResearchInterestItem = {
      title: 'New Research Area',
      description: '',
      order: research.researchInterests.length + 1,
    };
    setResearch({
      ...research,
      researchInterests: [...research.researchInterests, next],
    });
  }

  return (
    <div className="space-y-8">
      {research ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Research Content &amp; Interests
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveResearch('save_draft')}
                className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveResearch('publish')}
                className="px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
              >
                Publish Live
              </button>
            </div>
          </div>

          {feedback ? (
            <div className="rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200">
              {feedback}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold mb-1.5">Academic Background</label>
            <textarea
              rows={2}
              value={research.academicBackground}
              onChange={(e) => setResearch({ ...research, academicBackground: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Engineering Research Summary</label>
              <textarea
                rows={3}
                value={research.engineeringResearchSummary}
                onChange={(e) =>
                  setResearch({ ...research, engineeringResearchSummary: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Data Science &amp; ML Summary</label>
              <textarea
                rows={3}
                value={research.dataScienceSummary}
                onChange={(e) => setResearch({ ...research, dataScienceSummary: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Renewable Energy Summary</label>
              <textarea
                rows={3}
                value={research.renewableEnergySummary}
                onChange={(e) => setResearch({ ...research, renewableEnergySummary: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Research Interests</label>
              <button
                type="button"
                onClick={addInterest}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Interest</span>
              </button>
            </div>
            <div className="space-y-3">
              {research.researchInterests.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border border-slate-200 dark:border-slate-800 rounded-lg p-3"
                >
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...research.researchInterests];
                      updated[idx] = { ...item, title: e.target.value };
                      setResearch({ ...research, researchInterests: updated });
                    }}
                    className="md:col-span-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Short description"
                    onChange={(e) => {
                      const updated = [...research.researchInterests];
                      updated[idx] = { ...item, description: e.target.value };
                      setResearch({ ...research, researchInterests: updated });
                    }}
                    className="md:col-span-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = research.researchInterests.filter((_, i) => i !== idx);
                      setResearch({ ...research, researchInterests: updated });
                    }}
                    className="md:col-span-1 text-rose-600 hover:text-rose-700 p-1.5"
                    aria-label="Remove research interest"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Future Publications Note</label>
            <textarea
              rows={2}
              value={research.futurePublicationsNote}
              onChange={(e) => setResearch({ ...research, futurePublicationsNote: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : null}

      {/* Technical Skills Management */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-5">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
          Technical Skills &amp; Technologies
        </h2>

        <form onSubmit={addSkill} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill or technology name (e.g. FastAPI)"
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          />
          <select
            value={newSkillCat}
            onChange={(e) => setNewSkillCat(e.target.value as SkillItem['category'])}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
          >
            <option value="Website Development">Website Development</option>
            <option value="Data Analytics & ML">Data Analytics &amp; ML</option>
            <option value="AI Automation">AI Automation</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </form>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {skills.map((skill) => (
            <div key={skill._id} className="py-2.5 flex items-center justify-between gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  · {skill.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void deleteSkill(skill._id)}
                className="text-rose-600 hover:text-rose-700 p-1"
                aria-label={`Delete ${skill.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
