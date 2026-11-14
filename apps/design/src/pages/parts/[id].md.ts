import type { APIRoute, GetStaticPaths } from "astro";

// A markdown page per part, served at /design/parts/<id>.md where llms.txt links to it. The package
// builds them (tokens/parts); the guide serves them as written.
const pages = import.meta.glob("../../../../../packages/design-system/tokens/parts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const getStaticPaths = (() =>
  Object.entries(pages).map(([path, text]) => ({
    params: { id: path.replace(/^.*\/|\.md$/g, "") },
    props: { text },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.text as string, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
