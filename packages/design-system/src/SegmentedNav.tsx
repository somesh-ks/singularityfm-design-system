import type { HTMLAttributes } from "react";
import { passedAttributes } from "./attributes";
import Icon from "./Icon.tsx";
import type { IconName } from "./icons";

export interface SegmentedNavTab {
  value: string;
  /** The tab's words; with an icon, its name for a screen reader (aria-label). */
  label: string;
  /** A glyph tab: the glyph alone, centred on its pill (Costs' Chart and Table). */
  icon?: IconName;
  /** The tab's id, for a panel's aria-labelledby. */
  id?: string;
  /** The id of the panel it shows, which the page draws (aria-controls). */
  controls?: string;
}

interface SegmentedNavProps {
  /** Two to four views. */
  tabs: readonly SegmentedNavTab[];
  /** The view chosen when it is drawn (the first by default); mountSegmentedNav() moves it after. */
  defaultValue?: string;
  /** A chip's height on 44px columns, to sit in a row of chips. */
  compact?: boolean;
  /**
   * For placing it where it stands, or a hook a page's rule or script finds it by. Never its look.
   * An Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
}

type Props = SegmentedNavProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof SegmentedNavProps | "role" | "children">;

/**
 * The Segmented navigation (D132, D243, DS-8): the tablist of buttons the app's pages drew, rendered on
 * the server with no client directive. The chosen tab is aria-selected and the only one in the Tab
 * order. It ships no script: a page that draws one calls mountSegmentedNav() from segmentedNav.ts once
 * for each list, which chooses by a press or by Left, Right, Home and End and tells the page, and
 * selectTab() to show a view read from the address. The page draws the panels and shows the one
 * chosen (each tab's `controls`). Every other attribute (aria-label, data-*) goes on the tablist.
 */
export default function SegmentedNav({
  tabs,
  defaultValue = tabs[0]?.value,
  compact = false,
  className,
  ...passed
}: Props) {
  const classes = ["segmented-nav", compact && "segmented-nav-compact", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} role="tablist" {...passedAttributes(passed)}>
      {tabs.map((tab) => {
        const on = tab.value === defaultValue;
        return (
          <button
            key={tab.value}
            className="segmented-nav-tab"
            type="button"
            role="tab"
            id={tab.id}
            aria-selected={on ? "true" : "false"}
            aria-controls={tab.controls}
            aria-label={tab.icon ? tab.label : undefined}
            tabIndex={on ? undefined : -1}
            data-value={tab.value}
          >
            {tab.icon ? <Icon name={tab.icon} /> : tab.label}
          </button>
        );
      })}
    </div>
  );
}
