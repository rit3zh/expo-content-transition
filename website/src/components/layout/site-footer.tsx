import Link from 'next/link';
import { ArrowUpRight, MoveUpRight } from 'lucide';
import { Icon } from '@/components/ui/icon';
import { Signature } from '@/components/ui/signature';
import { site } from '@/lib/site';
import { Brand } from './brand';

const COLUMNS = [
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Quick start', href: '/docs/quick-start' },
      { label: 'Playground', href: '/docs/playground' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { label: 'Transitions', href: '/docs/guides/transitions' },
      { label: 'Formatting', href: '/docs/guides/formatting' },
      { label: 'Examples', href: '/docs/examples' },
      { label: 'Platforms', href: '/docs/guides/platforms' },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { label: 'GitHub', href: site.repo, out: true },
      { label: 'npm', href: site.npm, out: true },
      { label: 'Issues', href: `${site.repo}/issues`, out: true },
    ],
  },
];

const LINK =
  'inline-flex items-center gap-1 text-muted-foreground transition-colors duration-200 hover:text-foreground';

/**
 * Signed rather than stamped: the handwritten name is the footer's one
 * flourish, written in once when you first reach it.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-8 overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-4 pt-16 sm:grid-cols-[1.4fr_repeat(3,auto)] sm:gap-x-16 sm:px-6">
        <div className="col-span-2 flex flex-col items-start sm:col-span-1">
          <Brand />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-pretty text-muted-foreground">
            {site.tagline}. Every glyph rolls on its own, natively on iOS and Android.
          </p>
          <div className="mt-12 -ml-1">
            <Signature text="rit4hz" fontSize={12} duration={1.2} inView />
          </div>
        </div>

        {COLUMNS.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <p className="text-[13px] font-medium text-foreground">{title}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  {'out' in link ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className={LINK}>
                      {link.label}
                      <Icon icon={ArrowUpRight} hover={MoveUpRight} className="size-3 opacity-60" />
                    </a>
                  ) : (
                    <Link href={link.href} className={LINK}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-1 px-4 pb-10 text-xs text-muted-foreground/80 sm:flex-row sm:justify-between sm:px-6">
        <p className="tabular-nums">
          © 2026{' '}
          <a
            href={site.author.url}
            className="transition-colors duration-200 hover:text-foreground">
            {site.author.name}
          </a>
          {' · MIT licensed'}
        </p>
        <p>Previews run the library’s own web renderer.</p>
      </div>
    </footer>
  );
}
