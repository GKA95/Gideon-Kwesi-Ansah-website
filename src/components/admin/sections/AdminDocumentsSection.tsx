import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import { apiFetch, getCsrfToken } from '../../../services/api';
import type { SiteSettings, UploadedDocumentItem } from '../../../types/portfolio';

export function AdminDocumentsSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocumentItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'cv' | 'research_report' | 'technical_paper' | 'other'>('cv');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadAll() {
    const [dRes, sRes] = await Promise.all([
      apiFetch<{ documents: UploadedDocumentItem[] }>('/api/admin/documents'),
      apiFetch<{ settings: SiteSettings }>('/api/admin/settings'),
    ]);
    setDocuments(dRes.documents || []);
    setSettings(sRes.settings || null);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('isPublished', String(isPublished));

      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': getCsrfToken(),
        },
        credentials: 'include',
        body: formData,
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || 'Upload failed.');
      }

      setTitle('');
      setDescription('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setSuccess(
        category === 'cv'
          ? 'CV uploaded to Cloudinary and automatically linked to the public Download CV button.'
          : 'Document uploaded to Cloudinary.'
      );
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload document.');
    } finally {
      setUploading(false);
    }
  }

  async function setActiveCv(id: string) {
    await apiFetch(`/api/admin/documents/${id}/set-cv`, { method: 'PATCH' });
    setSuccess('Public Download CV button updated.');
    await loadAll();
  }

  async function deleteDoc(id: string) {
    await apiFetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            CV &amp; Research Documents (PDF)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active CV on public site:{' '}
            {settings?.cvDocumentUrl ? (
              <a
                href={settings.cvDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 dark:text-sky-400 underline"
              >
                {settings.cvFileName || 'Current CV PDF'}
              </a>
            ) : (
              'None uploaded yet'
            )}
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        ) : null}

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gideon Kwesi Ansah CV (2026)"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Document Category</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as 'cv' | 'research_report' | 'technical_paper' | 'other'
                )
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            >
              <option value="cv">Curriculum Vitae (CV)</option>
              <option value="research_report">Research Report</option>
              <option value="technical_paper">Technical Paper</option>
              <option value="other">Other Document</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs"
              />
              <label className="inline-flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span>Publish publicly</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-xs font-semibold"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading PDF...' : 'Upload PDF'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] divide-y divide-slate-200 dark:divide-slate-800">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No PDF documents uploaded yet.
          </div>
        ) : (
          documents.map((doc) => {
            const isActiveCv = settings?.cvDocumentUrl === doc.fileUrl;
            return (
              <div
                key={doc._id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5 text-sky-700 dark:text-sky-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {doc.title}
                      {isActiveCv ? ' · Active Public CV' : ''}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {doc.category} · {doc.fileName} ·{' '}
                      <span className="tabular-nums">
                        {Math.max(1, Math.round(doc.fileSizeBytes / 1024))} KB
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    Open PDF
                  </a>
                  {!isActiveCv && (
                    <button
                      type="button"
                      onClick={() => void setActiveCv(doc._id)}
                      className="px-3 py-1.5 rounded-lg border border-sky-600/40 text-xs font-medium text-sky-700 dark:text-sky-400"
                    >
                      Use as Public CV
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteDoc(doc._id)}
                    className="p-1.5 text-rose-600"
                    aria-label={`Delete ${doc.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
