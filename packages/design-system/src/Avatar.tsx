import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { useId, useState } from "react";
import { AVATAR_SHAPES, type AvatarSize, avatarArt, avatarClass } from "./avatar.ts";
import "../styles/avatar.css";

interface Props {
  /** The shape's id (AVATAR_SHAPES). The app passes the one the reader picked, or the mood's first. */
  shape?: string;
  size?: AvatarSize;
  /**
   * The reader's photo, where there is one: round with an accent ring, in place of the shape. The
   * shape stands in if it fails to load, once hydrated (client:load).
   */
  photo?: string;
  /** A button that opens the profile, named for a screen reader. Without it the avatar is a picture. */
  label?: string;
  /**
   * For placing the avatar where it stands. Never its look. An Astro page passes className too:
   * @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

/**
 * The Avatar (D326, DS-4, DS-7) on Base UI's Avatar: the photo, with the shape as its fallback. It
 * renders its whole look on the server. A shape is static markup that a script may redraw in place
 * (avatarMarkup, data-play, data-state, data-face), so it takes no client directive; a photo answers
 * a failed load only once hydrated, which Base UI reads even when the load ended before.
 */
export default function Avatar({ shape = "cookie", size = "md", photo, label, className }: Props) {
  const clip = `avatar-clip-${useId()}`;
  const [failed, setFailed] = useState(false);
  // A new photo is tried again: an island may pass the account's after a failed one.
  const [tried, setTried] = useState(photo);
  if (tried !== photo) {
    setTried(photo);
    setFailed(false);
  }
  const showPhoto = Boolean(photo) && !failed;
  const def = Object.hasOwn(AVATAR_SHAPES, shape) ? AVATAR_SHAPES[shape] : AVATAR_SHAPES.cookie;
  return (
    <BaseAvatar.Root
      className={[avatarClass(size, showPhoto), className].filter(Boolean).join(" ")}
      data-tone={showPhoto ? undefined : def?.tone}
      render={label ? <button type="button" aria-label={label} /> : undefined}
    >
      {showPhoto ? (
        // keepMounted draws the photo on the server, before Base UI knows it loaded.
        <BaseAvatar.Image
          keepMounted
          src={photo}
          alt=""
          onLoadingStatusChange={(status) => setFailed(status === "error")}
        />
      ) : (
        <BaseAvatar.Fallback
          render={
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              focusable="false"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: avatar.ts builds it from its own shapes and escapes nothing a caller passes; the shape id only picks one.
              dangerouslySetInnerHTML={{ __html: avatarArt(shape, clip) }}
            />
          }
        />
      )}
    </BaseAvatar.Root>
  );
}
