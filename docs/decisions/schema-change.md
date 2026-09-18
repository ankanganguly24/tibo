# Schema change

## Scenario

A change adds a nullable approval_reason field to a persisted record and updates the write path.

## Tibo finding

~~~text
schema changed        approval_reason
  evidence: db/schema.sql, src/models/run.ts
  limitation: Tibo cannot determine whether old records need backfill.
~~~

## Expected decision

The developer keeps the finding and records whether a migration or backfill is required before merge.
