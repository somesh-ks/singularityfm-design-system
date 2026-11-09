import type { AnchorHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import { type LinkVariant, linkClass } from "./link";

interface LinkProps {
  /** Where it goes. A link always has an address; an action on this page is a Button. */
  href: string;
  /** Text (the default), a link in a line of words, or source, a story's publisher (link.ts). */
  variant?: LinkVariant;
  /**
   * For placing the link where it stands, or a hook a page's rule or script finds it by. Never its
   * look. An Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the link in its parent's slot with it; it is not an attribute of the link. */
  slot?: string;
  /** The words. */
  children: ReactNode;
}

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/**
 * The Link (DS-3): static, so it renders on the server with no client directive and ships no script.
 * Never a Base UI primitive (DS-4): it is a real `<a href>`. A source link wraps its words in a span,
 * which carries the ellipsis and the underline that draws in on hover (primitives.css).
 */
export default function Link({
  href,
  variant = "text",
  className,
  slot: _slot,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const classes = [linkClass(variant), className].filter(Boolean).join(" ");
  return (
    <a className={classes} href={href} {...rest}>
      {variant === "source" ? <span>{children}</span> : children}
    </a>
  );
}
