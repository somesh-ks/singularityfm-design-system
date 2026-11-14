import { COMPONENTS as REGISTRY } from "@singularity/design-system/registry";
import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute, GetStaticPaths } from "astro";
import { type ComponentSpec, labelOf, SPECS } from "../../lib/components";

const prebuilt = import.meta.glob("../../../../../packages/design-system/tokens/components/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const cell = (text: string): string =>
  text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

const formatProps = (component: (typeof system.components)[number]): string[] => {
  const out: string[] = [];
  if (component.props.length > 0) {
    out.push("| Name | Type | Default | What it does |", "| --- | --- | --- | --- |");
    for (const prop of component.props) {
      const type = prop.values
        ? prop.values.map((value) => `"${value}"`).join(" | ")
        : cell(prop.type);
      const escapedType = type.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
      out.push(
        `| \`${prop.name}${prop.required ? "" : "?"}\` | \`${escapedType}\` | ${prop.default ? `\`${cell(prop.default)}\`` : "-"} | ${cell(prop.description) || "-"} |`,
      );
    }
  }
  if (component.element) {
    out.push(
      "",
      `Every attribute of a native \`<${component.element}>\` element passes through${
        component.except
          ? `, except ${component.except.map((name) => `\`${name}\``).join(" and ")}`
          : ""
      }.`,
    );
  }
  return out;
};

export const getStaticPaths = (() =>
  SPECS.map((spec) => ({ params: { slug: spec.slug }, props: { spec } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const spec = props.spec as ComponentSpec;
  const prebuiltMatch = Object.entries(prebuilt).find(([path]) =>
    path.endsWith(`/${spec.slug}.md`),
  );
  if (prebuiltMatch) {
    return new Response(prebuiltMatch[1], {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const registered = REGISTRY.find((component) => component.name === spec.registry);
  const guidance = registered ?? spec.guidance;
  const files = [spec.file, ...(spec.subparts ?? []).map((part) => part.file)].filter(
    (file): file is string => Boolean(file),
  );
  const matchingComponents = files
    .map((file) => system.components.find((candidate) => candidate.file.endsWith(`/${file}`)))
    .filter((component): component is (typeof system.components)[number] => Boolean(component));
  const importList = matchingComponents.map((component) => component.import);
  const mainComponent = spec.file
    ? system.components.find((candidate) => candidate.file.endsWith(`/${spec.file}`))
    : undefined;
  const a11y = registered?.a11y ?? mainComponent?.a11y;
  const title = labelOf(spec);

  const lines: string[] = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    `id: ${spec.slug}`,
    `name: ${JSON.stringify(title)}`,
    "kind: component",
    importList.length > 0 ? "imports:" : "imports: []",
    ...importList.map((imp) => `  - ${JSON.stringify(imp)}`),
    "---",
    "",
    `# ${title}`,
    "",
  ];

  if (guidance?.summary) lines.push(guidance.summary, "");
  if (spec.noPreview) lines.push(spec.noPreview, "");

  if (importList.length > 0) {
    lines.push("## Import", "");
    for (const imp of importList) lines.push(`- \`${imp}\``);
    lines.push("");
  }

  if (mainComponent?.example) {
    lines.push("## Example", "", "```tsx", mainComponent.example, "```", "");
  }

  if (a11y) {
    lines.push("## Accessibility", "", `- Role: ${a11y.role}`);
    for (const line of a11y.aria) lines.push(`- ARIA: ${line}`);
    for (const line of a11y.keyboard) lines.push(`- Keyboard: ${line}`);
    if (a11y.focus) lines.push(`- Focus: ${a11y.focus}`);
    lines.push("");
  }

  if (registered?.experimental && registered.experimental.length > 0) {
    lines.push("## Experimental options", "");
    for (const item of registered.experimental)
      lines.push(`- \`${item.option}\` (since ${item.since}): ${item.reason}`);
    lines.push("");
  }

  if (mainComponent && (mainComponent.props.length > 0 || mainComponent.element)) {
    lines.push(`## Props of ${mainComponent.name}`, "", ...formatProps(mainComponent), "");
  }

  if ((spec.subparts ?? []).length > 0) {
    lines.push("## Subparts", "");
    for (const subpart of spec.subparts ?? []) {
      const subComponent = system.components.find((candidate) =>
        candidate.file.endsWith(`/${subpart.file}`),
      );
      lines.push(`### ${subpart.name}`, "", subpart.note, "");
      if (subComponent?.example) lines.push("```tsx", subComponent.example, "```", "");
      if (subComponent && (subComponent.props.length > 0 || subComponent.element)) {
        lines.push(...formatProps(subComponent), "");
      }
    }
  }

  if (registered && spec.noPreview) {
    lines.push(
      "## Classes",
      "",
      `${registered.classes.map((name) => `.${name}`).join(", ")}, in ${registered.sheet}.`,
      "",
    );
  }

  const relatedParts = system.parts.filter((part) => importList.includes(part.imports[0] ?? ""));
  if (relatedParts.length > 0) {
    lines.push("## Related parts", "");
    for (const part of relatedParts)
      lines.push(`- [${part.id}](../parts/${part.id}.md): ${part.summary}`);
    lines.push("");
  }

  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
