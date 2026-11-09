import { Slider as BaseSlider } from "@base-ui/react/slider";
import { type ComponentProps, type CSSProperties, useState } from "react";
import { passedAttributes, styleObject } from "./attributes";
import { sliderClass, sliderWaveFieldClass } from "./slider";
import "../styles/slider.css";

interface SliderProps {
  /**
   * For placing the slider where it stands (a width, a flex basis). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /**
   * A hue: the rail is the whole spectrum, the thumb is the colour picked, and a swatch floats above it
   * while it is held (D328).
   */
  hue?: boolean;
  /**
   * The track up to the thumb drifts (a wave in Expressive, a zigzag in Halloween) and the rest stays
   * straight; Default draws the plain Slider.
   */
  wavy?: boolean;
  /**
   * The value, as the state of a React island: pair it with onValueChange. A number, or its digits as
   * an Astro attribute gives them, as min, max and step take too.
   */
  value?: number | string;
  /**
   * The value when it is first drawn; it then keeps its own. An Astro page passes this. Left out, the
   * middle of the range, as a native range's.
   */
  defaultValue?: number | string;
  /** The low end. */
  min?: number | string;
  /** The high end. */
  max?: number | string;
  /** The distance between two values it can stop at. */
  step?: number | string;
  /** Told each value while the thumb moves. */
  onValueChange?: (value: number) => void;
  /** Its name for a screen reader. This and the three below reach the hidden range input. */
  "aria-label"?: string;
  /** The id of the words that name it: its row's label. */
  "aria-labelledby"?: string;
  /** The id of the words that say more about it. */
  "aria-describedby"?: string;
  /** The value as words, when the number alone says too little ("70 percent"). */
  "aria-valuetext"?: string;
  /** -1 keeps it out of the tab order (a picture of it). */
  tabIndex?: number;
}

type Props = SliderProps &
  Omit<
    ComponentProps<typeof BaseSlider.Root>,
    keyof SliderProps | "render" | "children" | "thumbAlignment"
  >;

/**
 * The Slider (DS-4, DS-7) on Base UI's Slider. Its parts are spans, so it stands wherever the native
 * range did: the root (.slider-input) is the 44px target, the control inside it is inset by half a
 * thumb so the thumb travels as a native thumb does and never leaves the rail, the track is the
 * thumb's travel, and the thumb holds the hidden range input that takes focus, the arrow keys and
 * `name`. It keeps --range-fill from its own value, on the root and on a hue or wavy field, so no
 * caller does. It renders its whole look on the server; it answers a drag once it hydrates, so an
 * Astro page draws it with `client:visible` and a React island draws it as it is. `id` is the root's;
 * a row's label names it through aria-labelledby, since a `<label for>` cannot reach the hidden input.
 */
export default function Slider({
  className,
  hue = false,
  wavy = false,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-valuetext": ariaValueText,
  tabIndex,
  style,
  ...rest
}: Props) {
  const low = Number(min);
  const high = Number(max);
  const stride = Number(step);
  // A native range with no value rests at its midpoint, on a step.
  const middle = low + Math.round((high - low) / 2 / stride) * stride;
  const [own, setOwn] = useState(() => Number(defaultValue ?? middle));
  const current = value === undefined ? own : Number(value);
  const fill = { "--range-fill": `${((current - low) / (high - low)) * 100}%` } as CSSProperties;
  const placed = hue || wavy;
  const slider = (
    <BaseSlider.Root
      {...passedAttributes(rest)}
      className={[sliderClass(), placed ? undefined : className].filter(Boolean).join(" ")}
      style={{ ...(typeof style === "string" ? styleObject(style) : style), ...fill }}
      value={current}
      min={low}
      max={high}
      step={stride}
      onValueChange={(next) => {
        const number = Array.isArray(next) ? (next[0] ?? low) : next;
        if (value === undefined) setOwn(number);
        onValueChange?.(number);
      }}
      render={<span />}
    >
      <BaseSlider.Control render={<span />}>
        <BaseSlider.Track render={<span />}>
          <BaseSlider.Thumb
            render={<span />}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-valuetext={ariaValueText}
            tabIndex={tabIndex}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
  if (hue)
    return (
      <span className={["slider-hue-field", className].filter(Boolean).join(" ")} style={fill}>
        {slider}
        <span className="slider-hue-swatch" aria-hidden="true" />
      </span>
    );
  if (wavy)
    return (
      <span className={[sliderWaveFieldClass(), className].filter(Boolean).join(" ")} style={fill}>
        {slider}
      </span>
    );
  return slider;
}
