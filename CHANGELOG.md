# Changelog

## Unreleased

- Added a portable `tibo-review` skill for Codex and Claude Code that uses the
  local CLI and records explicit decisions.
- Added `tibo decide <id> <keep|reject|later>` for non-interactive integrations.
- Added line-level evidence for dependencies, environment variables, schema
  signals, untracked files, and rendered ledger entries.
- Added bounded lexical repository matches for possible existing dependencies or
  internal utilities, with an explicit non-equivalence limitation.
- Added an optional skill remediation flow that requires explicit approval,
  runs tests, and rescans after the host agent edits rejected changes.
- Added `tibo summary` and its JSON contract for fresh agent sessions.
- Classified potentially destructive schema and migration statements with high
  severity and explicit safety limitations.
- Added findings for newly exported TypeScript and JavaScript symbols.
- Added low-confidence possible-overlap findings for newly added modules and
  nearby rollback-file evidence for schema changes.
- Marked synthetic untracked-file diffs as new files so module analysis works
  before a file is staged.
- Expanded the roadmap with concrete user outcomes, implementation slices,
  evidence requirements, and phase exit criteria.
- Added a living project timeline and recorded dependency evidence as the next
  implementation priority: package/version, changed lines, usage locations, and
  existing alternatives.
- Reframed Tibo as a local-first decision ledger for coding-agent changes.
- Replaced the context-assistant README with the structural detection and ledger product promise.
- Added architecture, roadmap, and project timeline documentation.
- Removed unsupported promises around learning mode, token savings, and model-powered detection from the first release scope.
