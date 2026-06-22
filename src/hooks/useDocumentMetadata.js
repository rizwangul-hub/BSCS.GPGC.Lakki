import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and meta tags for SEO
 * @param {String} title - Page title
 * @param {String} description - Page description
 */
const useDocumentMetadata = (title, description) => {
  useEffect(() => {
    // 1. Update Page Title
    document.title = title;

    // 2. Update Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Update Open Graph (OG) Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // 4. Update Open Graph (OG) Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);
  }, [title, description]);
};

export default useDocumentMetadata;
