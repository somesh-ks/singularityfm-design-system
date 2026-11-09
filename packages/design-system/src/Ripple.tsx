import "../styles/ripple.css";

/**
 * The Ripple's layer (DS-3): static, so it renders on the server with no client directive and ships
 * no script. A control that carries `data-ripple` holds it; installRipple() (ripple.ts) draws the wave.
 */
export default function Ripple() {
  return <span className="ripple-area" aria-hidden="true" />;
}
