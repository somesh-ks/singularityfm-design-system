import { sheetHeadClass } from "./sheet.ts";
import { type SheetClose, sheetHeadContentHtml } from "./sheetHead.ts";

interface Props {
  /** The sheet's name: an h2 whose id the dialog's aria-labelledby names. */
  title: string;
  titleId: string;
  /** The data attribute the sheet's script finds its Close button by. */
  close: SheetClose;
  /** Any data attribute the title carries for its script, such as data-panel-title. */
  titleData?: Record<`data-${string}`, string | boolean>;
  /** A quiet line under the title: what the sheet is about, as a menu's item facts. */
  subtitle?: string;
}

/**
 * The Sheet's header row (DS-3): static, so it renders on the server with no client directive and
 * ships no script. What the row holds is sheetHead.ts, shared with the lists a script redraws
 * (structureView.ts), so every sheet header is one markup: the title at the start, Close at the end
 * (2026-10-20).
 */
export default function SheetHeader({ title, titleId, close, titleData = {}, subtitle }: Props) {
  return (
    <div
      className={sheetHeadClass()}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the one markup is the string the scripts write too, and sheetHead.ts escapes the title and its data.
      dangerouslySetInnerHTML={{
        __html: sheetHeadContentHtml(title, titleId, close, titleData, subtitle),
      }}
    />
  );
}
