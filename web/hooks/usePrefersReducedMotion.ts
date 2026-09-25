import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const matchReducedMotion = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY)
    : null;

const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() => matchReducedMotion()?.matches ?? false);

  useEffect(() => {
    const query = matchReducedMotion();
    if (!query) return;

    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

export { usePrefersReducedMotion };
