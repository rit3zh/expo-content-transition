const STEPS_PER_PX = 8;
const MIN_RADIUS = 0.375;
const MAX_CACHED = 512;

const SIGMA_SCALE = 0.57735;
const SIGMA_BIAS = 0.5;

const NO_FILTER = 'none';

const cache = new Map<number, string>();

const sigma = (radius: number): number => (radius > 0 ? radius * SIGMA_SCALE + SIGMA_BIAS : 0);

const filter = (radius: number): string => {
  if (!(radius >= MIN_RADIUS)) return NO_FILTER;

  const bucket = Math.round(radius * STEPS_PER_PX);
  const cached = cache.get(bucket);
  if (cached) return cached;

  if (cache.size >= MAX_CACHED) cache.clear();

  const value = `blur(${sigma(bucket / STEPS_PER_PX).toFixed(3)}px)`;
  cache.set(bucket, value);
  return value;
};

const GlyphBlur = { NO_FILTER, sigma, filter } as const;

export { GlyphBlur };
