import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
}

const Seo = ({ title, description, canonical = "/" }: SeoProps) => {
  useEffect(() => {
    document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', description ?? title);

    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', canonical);
  }, [title, description, canonical]);
  return null;
};

export default Seo;
