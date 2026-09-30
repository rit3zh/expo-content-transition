# expo-content-transition docs

The documentation site for [expo-content-transition](https://github.com/rit3zh/expo-content-transition): Next.js 16, [fumadocs](https://fumadocs.dev) for the MDX content, deployed to Cloudflare Workers with [OpenNext](https://opennext.js.org/cloudflare).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the live examples work

Every preview on the site runs the package's own web renderer. `scripts/sync-engine.mjs` copies the framework-free part of `../web` (everything except the React Native `<View>` wrapper) into `src/lib/numeric-text/engine/`, and `src/components/numeric-text/numeric-text.tsx` drives it on a DOM element with the same props as the real `NumericText`.

The copy is generated on `npm install`, `dev` and `build`, and is gitignored. Edit the engine in `../web`, never the copy.

## Where things live

| Path | What |
| --- | --- |
| `content/docs/` | The docs pages, in MDX. `meta.json` files order the sidebar. |
| `src/lib/examples.ts` | The React Native code shown beside each live example. |
| `src/components/examples/demos.tsx` | The live halves of those examples. Keep the two in step. |
| `src/lib/props.ts` | The prop tables, following the package's JSDoc. |
| `src/components/playground/` | The playground: controls, preview and generated code. |
| `src/components/home/` | The landing page sections. |

MDX pages can use `<Example id="…" />`, `<ExampleGrid />`, `<Compare prop="…" values={[…]} />`, `<Playground />` and `<PropsTable of="…" />`, alongside `Callout`, `Cards`, `Steps` and `CommandTabs`.

Every page also has a Markdown twin at `/docs/<page>.mdx`, plus `/llms.txt` and `/llms-full.txt`; `src/lib/markdown.ts` turns the live blocks back into code for those.

## Deploy

```bash
npm run deploy    # build and deploy to Cloudflare
npm run preview   # build and run locally on the Workers runtime
```

Set `NEXT_PUBLIC_SITE_URL` to the production URL so canonical links, the sitemap and `llms.txt` point at it.
