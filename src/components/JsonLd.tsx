import { useEffect } from 'react';

const JsonLd = () => {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-jsonld="org"]');
    if (existingScript) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Project GLO',
      url: 'https://project-glo.lovable.app',
      logo: 'https://project-glo.lovable.app/lovable-uploads/30905c4c-1642-4dea-815c-274ba24b49b4.png',
      description: 'Trauma-informed AI platform connecting vulnerable women in Kenya with verified support services.',
      foundingDate: '2024',
      areaServed: { '@type': 'Country', name: 'Kenya' },
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English', 'Swahili'],
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-jsonld', 'org');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, []);

  return null;
};

export default JsonLd;
