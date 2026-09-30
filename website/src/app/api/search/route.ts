import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The index is built once at build time and searched in the browser, so
// search is instant and costs the worker nothing.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
