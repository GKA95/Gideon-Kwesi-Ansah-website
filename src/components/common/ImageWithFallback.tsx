import { useState } from 'react';
import { Layers } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  aspectClassName?: string;
  eager?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
  aspectClassName = '',
  eager = false,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 dark:from-[#0D1B2E] dark:via-[#091424] dark:to-[#0F243D] text-slate-500 dark:text-slate-400 p-6 text-center select-none ${aspectClassName}`}
        role="img"
        aria-label={alt}
      >
        <Layers className="w-7 h-7 mb-2 text-sky-600/70 dark:text-sky-400/70" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-tight text-slate-600 dark:text-slate-300 max-w-[22ch]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
