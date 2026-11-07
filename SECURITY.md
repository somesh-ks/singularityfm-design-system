# Security

## Reporting a vulnerability

Report it privately through GitHub: the repository's Security tab, "Report a vulnerability". Do not open a
public issue. You get an answer within seven days.

## Scope

The published package `@singularityfm/design-system` and the style guide. The package ships Astro source,
stylesheets and static assets; it reads no secrets and makes no network requests.

## Supply chain

- Releases are published from `.github/workflows/release.yml` only, by npm trusted publishing (OIDC, no
  stored token), with provenance. A version without a provenance statement did not come from here.
- Actions are pinned to a commit SHA. The lockfile is installed with `--frozen-lockfile --ignore-scripts`.
- Every pull request is scanned for secrets (gitleaks) and for high or critical advisories in what ships.
