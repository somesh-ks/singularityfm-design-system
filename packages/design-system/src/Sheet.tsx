import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { passedAttributes, styleObject } from "./attributes";
import SheetHeader from "./SheetHeader.tsx";
import { sheetBodyClass, sheetClass } from "./sheet";
import type { SheetClose } from "./sheetHead";
import "../styles/sheet.css";

interface SheetProps {
  /** The sheet's name: an h2 whose id the dialog's aria-labelledby names. */
  title: string;
  titleId: string;
  /** The data attribute the sheet's script finds its Close button by. */
  close: SheetClose;
  /** Any data attribute the title carries for its script, such as data-panel-title. */
  titleData?: Record<`data-${string}`, string | boolean>;
  /** "create" is the New episode sheet; every other sheet is a "panel". */
  kind?: "create" | "panel";
  /**
   * For placing the sheet where it stands. Never its look. An Astro page passes className too:
   * @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** The form or list, inside the scrolling body. */
  children?: ReactNode;
  /** What sits after the body, outside its scroll: a sticky foot, a hidden part a script reads. */
  after?: ReactNode;
}

type Props = SheetProps &
  Omit<ComponentProps<"dialog">, keyof SheetProps | "open" | "style"> & {
    /** A string, as the deprecated .astro path takes it, or the object React does. */
    style?: CSSProperties | string;
  };

/**
 * The Sheet (DS-3): a native modal `<dialog>` (D262), drawn closed on the server with no client
 * directive and no script of its own, so a page's script finds it by SHEET_SELECTOR, opens it with
 * showModal() and gives it its gestures (sheetGestures, pullDismiss.ts), and a script can clone it
 * from a template. The Base UI islands' modal is the Drawer.
 */
export default function Sheet({
  title,
  titleId,
  close,
  titleData,
  kind = "panel",
  className,
  children,
  after,
  style,
  ...passed
}: Props) {
  return (
    <dialog
      className={[sheetClass(), className].filter(Boolean).join(" ")}
      data-sheet={kind}
      aria-labelledby={titleId}
      {...passedAttributes(passed)}
      style={typeof style === "string" ? styleObject(style) : style}
    >
      <SheetHeader title={title} titleId={titleId} close={close} titleData={titleData} />
      <div className={sheetBodyClass()}>{children}</div>
      {after}
    </dialog>
  );
}
