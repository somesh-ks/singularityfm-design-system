import type { SectionRef } from "./section";

interface Props {
  sections: readonly SectionRef[];
}

/**
 * The chapter list (DS-3): static, so it renders on the server with no client directive and ships no
 * script. Shown from 80rem, where it replaces the section tabs. Every entry is a link to its section,
 * with or without audio: this list is for moving around the page, and the chips are for playing.
 */
export default function ChapterAside({ sections }: Props) {
  return (
    <nav className="aside" aria-labelledby="aside-title">
      <div className="aside-rail">
        <h2 className="aside-title" id="aside-title">
          Contents
        </h2>
        {/* biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics under list-style: none */}
        <ul role="list">
          {sections.map((section, index) => (
            <li key={section.slug}>
              <a
                className="aside-link"
                href={`#c-${section.slug}`}
                data-astro-history="replace"
                data-section={section.slug}
                aria-current={index === 0 ? "true" : undefined}
              >
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
