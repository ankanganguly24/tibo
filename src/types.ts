export type FindingKind = "dependency" | "env" | "schema" | "interface" | "module";
export type Confidence = "high" | "medium" | "low";
export type Severity = "low" | "medium" | "high";
export type Decision = "unreviewed" | "keep" | "reject" | "later";

export type Evidence = { path: string; line?: number; detail: string };

export type Finding = {
  id: string;
  kind: FindingKind;
  summary: string;
  evidence: Evidence[];
  confidence: Confidence;
  severity: Severity;
  limitation: string;
  decision?: Decision;
};

export type LedgerEntry = Finding & {
  decision: Exclude<Decision, "unreviewed">;
  decidedAt: string;
};
