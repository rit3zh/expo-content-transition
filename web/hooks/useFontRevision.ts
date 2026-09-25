import { useEffect, useState } from 'react';

const useFontRevision = (): number => {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (!fonts) return;

    const bump = () => setRevision((current) => current + 1);
    fonts.addEventListener('loadingdone', bump);
    return () => fonts.removeEventListener('loadingdone', bump);
  }, []);

  return revision;
};

export { useFontRevision };
