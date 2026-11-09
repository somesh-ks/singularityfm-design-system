import type { SectionRef } from "./section.ts";

interface Props {
  sections: readonly SectionRef[];
}

/**
 * The section tabs of a briefing or an episode (DS-3): static, so they render on the server with no
 * client directive and ship no script. Drawn only for two sections or more: one would only name the
 * heading under it (owner, 2026-10-24). Plain links to the sections, complete without script;
 * briefingPage.ts moves the mark to the section in view. The bar sticks and draws the surface; the
 * strip inside it scrolls and fades its ends (primitives.css). Placed inside the wrapper of the
 * sections (.briefing), so it lets go after the last one. Links, never Base UI tabs (DS-4). Its data
 * hooks are written empty, as the Astro tabs printed them: a bare one prints as "true" in React.
 */
export default function SectionTabs({ sections }: Props) {
  if (sections.length < 2) return null;
  return (
    <div className="tabs-bar" data-tabs-bar="">
      <nav className="tabs scroll-fade-inline" aria-label="Sections" data-section-tabs="">
        {sections.map((section, index) => (
          <a
            key={section.slug}
            className="tab"
            href={`#c-${section.slug}`}
            data-astro-history="replace"
            data-section={section.slug}
            aria-current={index === 0 ? "true" : undefined}
          >
            {section.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
