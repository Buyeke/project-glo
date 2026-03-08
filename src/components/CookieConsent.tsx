import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'glo_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (value: 'all' | 'essential') => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ type: value, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[60]"
        >
          <Card className="p-4 shadow-lg border-border bg-card">
            <button
              onClick={() => accept('essential')}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm text-foreground font-semibold mb-1">Cookie Notice</p>
            <p className="text-xs text-muted-foreground mb-3">
              We use essential cookies to keep the site running and optional analytics cookies to improve your experience. 
              Your data is handled per Kenya's Data Protection Act 2019. 
              <a href="/privacy-policy" className="underline text-primary ml-1">Privacy Policy</a>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => accept('essential')} className="text-xs">
                Essential Only
              </Button>
              <Button size="sm" onClick={() => accept('all')} className="text-xs">
                Accept All
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
