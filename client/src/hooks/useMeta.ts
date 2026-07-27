import { useEffect } from 'react';
interface MetaProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogTitle?: string;
}

export function useMeta({ title, description, ogImage, ogTitle }: MetaProps) {
  useEffect(() => {
    if (title) document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      let el = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(property ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) setMeta('description', description);
    if (ogTitle) setMeta('og:title', ogTitle, true);
    if (ogImage) setMeta('og:image', ogImage, true);

    // Optional cleanup: not strictly necessary for meta tags
  }, [title, description, ogImage, ogTitle]);
}