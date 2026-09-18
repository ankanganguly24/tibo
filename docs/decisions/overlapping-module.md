# Overlapping module

## Scenario

A change adds src/utils/mail.ts while the repository already has src/email/send.ts with a similar responsibility.

## Tibo finding

~~~text
parallel module       src/utils/mail.ts
  evidence: src/email/send.ts, src/utils/mail.ts
  limitation: Similar names do not prove duplicate behavior.
~~~

## Expected decision

The developer rejects the new module, or keeps it with a recorded reason for the separate boundary.
