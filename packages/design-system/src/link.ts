/**
 * The Link: words that go to an address, its variants and when to use each. The one place its
 * classes are written. Link.tsx renders from it; a script or a React island that draws one calls
 * linkClass(); the style guide lists LINK. The rules are in styles/primitives.css.
 */
import type { Guidance } from "./guidance";

export type LinkVariant = "text" | "source";

export const LINK: Guidance & { variants: Record<LinkVariant, Guidance & { label: string }> } = {
  summary: "Words that go to an address: a real link, never a button dressed as one.",
  useWhen: [
    "The words are part of a sentence or a hint and open another page.",
    "A story names the publisher it came from.",
  ],
  dontUseWhen: [
    { when: "The control does something on this page.", instead: "Button.text" },
    {
      when: "It is the one action of a surface, even one that goes to an address.",
      instead: "Button.filled",
    },
  ],
  variants: {
    text: {
      label: "Text",
      summary: "A link inside a line of small text; the words stay inline, the target is 44px.",
      useWhen: ["A link inside a hint, a sentence or a breadcrumb."],
      dontUseWhen: [{ when: "It stands alone as an action.", instead: "Button.text" }],
    },
    source: {
      label: "Source",
      summary: "The one link out of a story: the publisher's name, underlined on hover.",
      useWhen: ["Name the publisher a story or a highlight came from."],
      dontUseWhen: [{ when: "It sits inside a sentence.", instead: "Link.text" }],
    },
  },
};

const VARIANT_CLASS: Record<LinkVariant, string> = { text: "text-link", source: "source-link" };

/** Every class the Link draws, for the registry and its test. */
export const LINK_CLASSES: string[] = Object.values(VARIANT_CLASS);

/** Classes the Link replaced; none may be written again, in any app that draws the system. */
export const LINK_RETIRED: string[] = [];

/** The class of a link of this variant. A source link wraps its words in a span (the underline). */
export const linkClass = (variant: LinkVariant = "text"): string => VARIANT_CLASS[variant];
