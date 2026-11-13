import { useEffect } from 'react';
import ogSocialCard from '../../assets/images/og_social_card_1794571262684.jpg';

interface SeoHeadProps {
  title: string;
  description: string;
  imageUrl?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function SeoHead({
  title,
  description,
  imageUrl,
  noindex = false,
  structuredData,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const resolvedImage =
      imageUrl && imageUrl.trim()
        ? imageUrl.trim()
        : `${window.location.origin}${ogSocialCard}`;

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', resolvedImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', resolvedImage);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const existingJsonLd = document.getElementById('gka-structured-data');
    if (structuredData && !noindex) {
      const script = existingJsonLd || document.createElement('script');
      script.id = 'gka-structured-data';
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredData);
      if (!existingJsonLd) {
        document.head.appendChild(script);
      }
    } else if (existingJsonLd) {
      existingJsonLd.remove();
    }
  }, [title, description, imageUrl, noindex, structuredData]);

  return null;
}
