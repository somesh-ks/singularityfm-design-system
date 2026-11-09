import Button from "./Button.tsx";
import { type BannerTone, type BannerVariant, bannerClass, bannerText } from "./banner.ts";
import Icon from "./Icon.tsx";
import type { IconName } from "./icons.ts";
import "../styles/banner.css";

interface Props {
  tone: BannerTone;
  /** "strip" is a band across the width for a state of the device; the place that holds it makes room for it. */
  variant?: BannerVariant;
  icon: IconName;
  /** A strip only: the glyph the icon is drawn over and strikes through (Wi-Fi, then Offline). */
  iconFrom?: IconName;
  title: string;
  body?: string;
  /** An id for the body line (the title when there is none), so a control the banner explains can point at it (aria-describedby). */
  bodyId?: string;
  /** One way on, as a text button. A link, so it works for any reader and without script. */
  action?: { label: string; href: string };
}

/** The Banner (DS-3): static, so it renders on the server with no client directive and ships no script. */
export default function Banner({
  tone,
  variant,
  icon,
  iconFrom,
  title,
  body,
  bodyId,
  action,
}: Props) {
  return (
    <div
      className={bannerClass()}
      data-tone={tone}
      data-variant={variant === "strip" ? "strip" : undefined}
      role={tone === "danger" ? "alert" : "status"}
    >
      {variant === "strip" ? (
        <span className="banner-signal">
          {iconFrom && <Icon name={iconFrom} className="banner-signal-layer banner-signal-from" />}
          <Icon
            name={icon}
            className={iconFrom ? "banner-signal-layer banner-signal-to" : undefined}
          />
        </span>
      ) : (
        <Icon name={icon} />
      )}
      <div className={bannerText.column}>
        <p className={bannerText.title} id={body ? undefined : bodyId}>
          {title}
        </p>
        {body && (
          <p className={bannerText.body} id={bodyId}>
            {body}
          </p>
        )}
      </div>
      {action && (
        <Button variant="text" href={action.href}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
