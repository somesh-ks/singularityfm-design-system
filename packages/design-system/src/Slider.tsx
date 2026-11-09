import type { CSSProperties, InputHTMLAttributes } from "react";
import { passedAttributes, styleObject } from "./attributes.ts";
import { sliderClass, sliderWaveFieldClass } from "./slider.ts";
import "../styles/slider.css";

interface SliderProps {
  /**
   * For placing the slider where it stands (a width, a flex basis). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** Inline style, as an object or the string an Astro page writes; never its look. */
  style?: CSSProperties | string;
  /**
   * A hue: the rail is the whole spectrum, the thumb is the colour picked, and a swatch floats above it
   * while it is held (D328). The caller keeps --range-fill on the field the slider is wrapped in.
   */
  hue?: boolean;
  /**
   * The track up to the thumb drifts (a wave in Expressive, a zigzag in Halloween) and the rest stays
   * straight; Default draws the plain Slider. The caller keeps --range-fill on the field the input is wrapped in.
   */
  wavy?: boolean;
}

type Props = SliderProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof SliderProps | "type">;

/**
 * The Slider (DS-8): the native `<input type="range">`, so it drags, takes the arrow keys and submits
 * before any script, and takes no client directive. An Astro page starts it with defaultValue; a React
 * island passes value with onChange. The caller keeps --range-fill, (value - min) / (max - min) as a
 * percentage, on the input, or on the field a hue or wavy Slider is wrapped in (slider.ts).
 */
export default function Slider({ className, style, hue = false, wavy = false, ...passed }: Props) {
  const placed = hue || wavy;
  const input = (
    <input
      {...passedAttributes(passed)}
      className={[sliderClass(), placed ? undefined : className].filter(Boolean).join(" ")}
      style={typeof style === "string" ? styleObject(style) : style}
      type="range"
    />
  );
  if (hue)
    return (
      <span className={["slider-hue-field", className].filter(Boolean).join(" ")}>
        {input}
        <span className="slider-hue-swatch" aria-hidden="true" />
      </span>
    );
  if (wavy)
    return (
      <span className={[sliderWaveFieldClass(), className].filter(Boolean).join(" ")}>{input}</span>
    );
  return input;
}
