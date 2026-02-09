import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedDate?: string;
}

const BASE_URL = "https://payding.lovable.app";

const useSeo = ({ title, description, path, type = "website", publishedDate }: SeoProps) => {
  useEffect(() => {
    const fullTitle = `${title} | Payding`;
    const url = `${BASE_URL}${path}`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, attribute = "name") => {
      let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    setMeta("description", description);

    // Open Graph
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", type, "property");
    setMeta("og:site_name", "Payding", "property");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    // Article-specific
    if (type === "article" && publishedDate) {
      setMeta("article:published_time", publishedDate, "property");
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = "Payding";
    };
  }, [title, description, path, type, publishedDate]);
};

export default useSeo;
