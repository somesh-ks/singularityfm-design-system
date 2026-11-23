import type { ComponentProps, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import BrandMark from "./BrandMark.tsx";
import "../styles/band.css";

interface BandProps {
  /** The heading's words: "Catchups". */
  title: string;
  /** What sits at the heading's end: a See all link (a Button text link). */
  action?: ReactNode;
  /**
   * For placing the band, or a hook a page's script finds it by. Never its look. An Astro page passes
   * className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** What the band holds: a shelf of cards, or result rows. */
  children: ReactNode;
}

type Props = BandProps & Omit<ComponentProps<"section">, keyof BandProps>;

/**
 * The Band: a section whose heading carries the Singularity mark, on the accent's subtle tint, out
 * to just past the page's gutter so its contents keep their line. Static: no client directive.
 */
export default function Band({ title, action, className, children, ...passed }: Props) {
  return (
    <section
      className={["band-section", className].filter(Boolean).join(" ")}
      {...passedAttributes(passed)}
    >
      <div className="band-head">
        <h2 className="band-title">
          <BrandMark />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
