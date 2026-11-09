---
"@singularityfm/design-system": patch
---

Every relative import in the package names its file (`./banner.ts`), so a bundler that resolves `.tsx` first or reads the disk without case (esbuild, a Windows or macOS disk) no longer picks the component `Banner.tsx` for its module `banner.ts`. That pick made the component import itself, and a consumer's bundle failed with "No matching export" for `bannerClass`, `buttonClass` and `iconClass`. Nothing changes for a build that already worked.
