# Decisions

One file per decision in [entries/](entries/), named `DS-<n>.md`, numbered from DS-1; its `- Status:` line
is its Index row (as D379 does in the app repo). A record is never rewritten: a change of mind is a new
record that says "supersedes DS-<n>" or "amends DS-<n>", and the old one's status says so. An entry that
supersedes adds `- Context changed:`; one whose reason can expire adds `- Revisit if:`.

Decisions made before this repository existed are D-records in the app repository; the ones that govern
the library are listed in [app-records.md](app-records.md). A DS record may amend one ("amends D253"); the
D-record is left as it is.

Find one with `grep -rn "keyword" docs/decisions/`.
