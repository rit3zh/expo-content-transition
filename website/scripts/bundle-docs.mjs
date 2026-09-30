// Workers have no filesystem, so the raw MDX behind "Copy page" and the
// llms routes is bundled into a module at build time.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../content/docs/", import.meta.url).pathname;
const out = new URL("../src/lib/raw-docs.generated.json", import.meta.url).pathname;

const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith(".mdx")).sort();
const docs = {};
for (const file of files) docs[relative(root, join(root, file)).split(sep).join("/")] = await readFile(join(root, file), "utf8");

await writeFile(out, `${JSON.stringify(docs)}\n`);
console.log(`Bundled ${files.length} docs into ${relative(process.cwd(), out)}`);
