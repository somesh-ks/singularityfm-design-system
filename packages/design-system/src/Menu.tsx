import { Menu as BaseMenu } from "@base-ui/react/menu";
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Icon from "./Icon";
import IconButton from "./IconButton";
import { InMenu } from "./MenuItem";
import { menuBodyClass, menuListClass } from "./menu";
import { pullToDismiss } from "./pullDismiss";
import { sheetHeadClass, sheetHeadingClass, sheetSubtitleClass, sheetTitleClass } from "./sheet";
import { installSheetTapGuard } from "./sheetTap";
import "../styles/menu.css";

/**
 * Base UI places its positioner by inline style (fixed or absolute at a translate), keeps it at opacity
 * 0 until it is measured and stops its transitions for the frame it mounts in. The list is in the top
 * layer, placed and moved by menu.css (its anchor, the phone's sheet, the entry and exit), so none of
 * that reaches it; Base UI's --available-height and --transform-origin still do.
 */
const TOP_LAYER = {
  position: undefined,
  top: undefined,
  left: undefined,
  transform: undefined,
  opacity: undefined,
  pointerEvents: undefined,
  transition: undefined,
};

interface MenuProps {
  /** The menu's id: a script, a hold or a select's data-opens finds it by this and opens it. */
  id: string;
  /** The sheet's header on a phone, and the menu's name for a screen reader. */
  title: string;
  /** A quiet line under the title on a phone's sheet, such as a card's facts. */
  subtitle?: string;
  /**
   * The button that opens it, an IconButton or a Button with its label. The Menu draws it as Base UI's
   * trigger, which adds aria-haspopup, aria-expanded and the press that opens and closes it.
   */
  trigger: ReactElement;
  /** Open, as the state of a React island: pair it with onOpenChange. */
  open?: boolean;
  /** Open when it is first drawn; it then keeps its own state. */
  defaultOpen?: boolean;
  /** Called with the new state whenever it opens or closes, by any means. */
  onOpenChange?: (open: boolean) => void;
  /**
   * For placing the popover under its own button (the anchor of a row or a story). Never its look.
   */
  className?: string;
  /** The rows: MenuItem, and a tiles row of them. */
  children: ReactNode;
}

/**
 * The Menu (DS-4) on Base UI's Menu: Base UI holds the open state, the keys (arrows, Home, End,
 * typeahead), focus in and back to the trigger, and the close on a pick, Escape, a press outside or
 * focus leaving. The list is still the browser's popover in the top layer, shown while Base UI has it
 * open, so menu.css draws it as before (a small menu under its button from 40rem, a bottom sheet with
 * a scrim on a phone, its entry and exit), it stays above an open dialog, and `:popover-open` and its
 * `toggle` events hold for the scripts and cues that read them. A script that opens or closes the
 * popover itself (a card's hold, a select's data-opens) opens or closes the menu.
 *
 * It answers only once it hydrates and draws its list only then (Base UI portals it): an Astro page
 * draws the Menu, its trigger and its rows inside one React island with client:load (an Astro slot
 * reaches an island as static markup, outside Base UI's tree).
 */
export default function Menu({
  id,
  title,
  subtitle,
  trigger,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: MenuProps) {
  const [own, setOwn] = useState(defaultOpen);
  const open = controlled ?? own;
  const state = useRef(open);
  state.current = open;
  const [list, setList] = useState<HTMLDivElement | null>(null);
  // The list is placed beside its trigger, as the Astro menu was, not under body: a host's scripts and
  // rules find it inside their own element, and in an open modal dialog it is not inert.
  const [host, setHost] = useState<HTMLElement | null>(null);
  const placed = useCallback((button: HTMLElement | null) => {
    if (button?.parentElement) setHost(button.parentElement);
  }, []);

  const change = useCallback(
    (next: boolean) => {
      if (next === state.current) return;
      state.current = next;
      if (controlled === undefined) setOwn(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  // Base UI's state is the popover's: shown in the top layer while open, hidden as it closes, so the
  // stylesheet's exit runs while Base UI waits for it.
  useLayoutEffect(() => {
    if (!list) return;
    if (open && !list.matches(":popover-open")) list.showPopover();
    if (!open && list.matches(":popover-open")) list.hidePopover();
  }, [list, open]);

  // A phone's sheet closes by a pull, and a tap beside it reaches nothing under it, as every sheet's.
  useEffect(() => {
    if (!list) return;
    installSheetTapGuard();
    pullToDismiss(list, () => list.hidePopover());
  }, [list]);

  // And the popover's state is Base UI's: light dismiss, a hold's showPopover or a pull's close.
  useEffect(() => {
    if (!list) return;
    const toggled = (event: Event): void => change((event as ToggleEvent).newState === "open");
    list.addEventListener("toggle", toggled);
    return () => list.removeEventListener("toggle", toggled);
  }, [list, change]);

  const heading = (
    <h2 className={sheetTitleClass()} id={`${id}-title`}>
      {title}
    </h2>
  );

  return (
    <BaseMenu.Root
      open={open}
      onOpenChange={(next) => change(next)}
      modal={false}
      highlightItemOnHover={false}
    >
      <BaseMenu.Trigger ref={placed} render={trigger} />
      {/* The portal's own element holds the list beside the trigger and takes no place in its row. */}
      <BaseMenu.Portal keepMounted container={host} style={{ display: "contents" }}>
        <BaseMenu.Positioner
          ref={setList}
          id={id}
          className={[menuListClass(), className].filter(Boolean).join(" ")}
          style={TOP_LAYER}
          popover="auto"
        >
          <div className={sheetHeadClass()}>
            {subtitle ? (
              <div className={sheetHeadingClass()}>
                {heading}
                <p className={sheetSubtitleClass()}>{subtitle}</p>
              </div>
            ) : (
              heading
            )}
            <IconButton label="Close" data-menu-close onClick={() => change(false)}>
              <Icon name="close" size="lg" />
            </IconButton>
          </div>
          <BaseMenu.Popup className={menuBodyClass()} aria-label={title}>
            <InMenu.Provider value={true}>{children}</InMenu.Provider>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
