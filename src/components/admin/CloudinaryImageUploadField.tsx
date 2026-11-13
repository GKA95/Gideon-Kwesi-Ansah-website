import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { getCsrfToken } from '../../services/api';

interface CloudinaryImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  helperText?: string;
}

export function CloudinaryImageUploadField({
  label,
  value,
  onChange,
  folder = 'general',
  helperText,
}: CloudinaryImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload/image', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': getCsrfToken(),
        },
        credentials: 'include',
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed.');
      }
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shrink-0">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={`Remove ${label}`}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null}

        <div className="flex-1 min-w-[200px] space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void handleFileSelect(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
            </button>

            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste HTTPS image URL"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {helperText ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          ) : null}
          {error ? <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
