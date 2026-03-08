import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

const defaultMeta = {
  title: 'Project GLO | Trauma-Informed Support Platform',
  description: 'Project GLO connects vulnerable women in Kenya with verified support services through a trauma-informed AI platform. Get matched to shelter, legal aid, counseling and more.',
  ogImage: '/lovable-uploads/30905c4c-1642-4dea-815c-274ba24b49b4.png',
};

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'Project GLO | Trauma-Informed Support Platform', description: defaultMeta.description },
  '/about': { title: 'About Project GLO | Our Mission & Impact', description: 'Learn about Project GLO\'s mission to connect vulnerable women with verified support services across Kenya.' },
  '/services': { title: 'Support Services | Project GLO', description: 'Browse verified support services including shelter, legal aid, counseling, and healthcare available through Project GLO.' },
  '/resources': { title: 'Resources | Project GLO', description: 'Access curated resources for support, safety planning, and empowerment through Project GLO.' },
  '/contact': { title: 'Contact Us | Project GLO', description: 'Reach out to Project GLO for support, partnership inquiries, or general questions.' },
  '/blog': { title: 'Blog | Project GLO', description: 'Read insights, stories, and updates from Project GLO on gender-based violence prevention and support.' },
  '/careers': { title: 'Job Opportunities | Project GLO', description: 'Find dignified work opportunities posted by verified employers through Project GLO.' },
  '/donate': { title: 'Donate | Project GLO', description: 'Support Project GLO\'s mission to empower vulnerable women in Kenya through your donation.' },
  '/partners': { title: 'Partner With Us | Project GLO', description: 'Join Project GLO as a partner organization and expand your reach to those who need support.' },
  '/privacy-policy': { title: 'Privacy Policy | Project GLO', description: 'Read Project GLO\'s privacy policy and data protection practices.' },
  '/terms-of-service': { title: 'Terms of Service | Project GLO', description: 'Review Project GLO\'s terms of service and usage guidelines.' },
  '/data-protection': { title: 'Data Protection | Project GLO', description: 'Learn how Project GLO protects your data under Kenya\'s Data Protection Act.' },
};

const SEOHead = ({ title, description, ogImage, ogType = 'website' }: SEOHeadProps) => {
  const location = useLocation();
  const baseUrl = 'https://project-glo.lovable.app';
  const currentUrl = `${baseUrl}${location.pathname}`;

  const pageSeo = pageMeta[location.pathname] || {};
  const finalTitle = title || pageSeo.title || defaultMeta.title;
  const finalDescription = description || pageSeo.description || defaultMeta.description;
  const finalImage = ogImage || defaultMeta.ogImage;
  const absoluteImage = finalImage.startsWith('http') ? finalImage : `${baseUrl}${finalImage}`;

  useEffect(() => {
    document.title = finalTitle;

    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', finalDescription, true);
    setMeta('og:title', finalTitle);
    setMeta('og:description', finalDescription);
    setMeta('og:image', absoluteImage);
    setMeta('og:url', currentUrl);
    setMeta('og:type', ogType);
    setMeta('og:site_name', 'Project GLO');
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', finalTitle, true);
    setMeta('twitter:description', finalDescription, true);
    setMeta('twitter:image', absoluteImage, true);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;
  }, [finalTitle, finalDescription, absoluteImage, currentUrl, ogType]);

  return null;
};

export default SEOHead;
