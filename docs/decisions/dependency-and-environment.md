# Dependency and environment change

## Scenario

A change adds a mail dependency and reads SMTP_FROM at startup.

## Tibo findings

~~~text
dependency added      nodemailer ^6.9
  evidence: package.json
  limitation: Tibo cannot tell whether the dependency was approved elsewhere.

new environment var   SMTP_FROM
  evidence: src/email/config.ts
  limitation: Tibo cannot infer the correct default or secret policy.
~~~

## Expected decision

The developer keeps both findings and records why the SMTP adapter is the intended integration.
