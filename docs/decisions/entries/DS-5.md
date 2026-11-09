## DS-5: a deprecated .astro path the apps call with `class` is a shim, not an alias

- Status: active; amends [DS-3](DS-3.md); amended by [DS-7](DS-7.md) (the shim of a component that needs hydration carries client:visible)
- Date: 2026-11-08
- Decision: DS-3 maps a migrated component's old path (`Button.astro`) to its `.tsx`. `@astrojs/react` drops a `class` prop before the component sees it, so an alias silently loses every `class=` the apps pass, and a removed prop is breaking ([COMPATIBILITY.md](../../../packages/design-system/COMPATIBILITY.md)). Where the apps still pass `class` (Icon about 35 times, BrandMark once), the old path stays an `.astro` file that only imports its own `.tsx` and renders it, `class` passed on as `className`, marked `@deprecated` with the replacement. The `.tsx` stays the one source: `designSystem.test.ts` lists the shims (`ASTRO_SHIMS`) and fails one with markup, logic or a stylesheet of its own. A shim goes in the breaking release that ends the `.astro` paths.
- Why: the family ships as a minor and no caller changes until it moves to the new import on its own time.
- Rejected: an alias, as the Button's (breaking for every `class=` caller, with nothing failing to say so); a second Astro implementation beside the React one (the twin DS-3 rejects).
- Revisit if: `@astrojs/react` starts passing `class` through as `className`.
