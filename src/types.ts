export type FindingKind = "dependency" | "env" | "schema" | "interface";
export type Confidence = "high" | "medium" | "low";
export type Decision = "unreviewed" | "keep" | "reject" | "later";

export type Evidence = { path: string; line?: number; detail: string };

export type Finding = {
  id: string;
  kind: FindingKind;
  summary: string;
  evidence: Evidence[];
  confidence: Confidence;
  limitation: string;
  severity?: "low" | "medium" | "high";
  decision?: Decision;
};

export type LedgerEntry = Finding & {
  decision: Exclude<Decision, "unreviewed">;
  decidedAt: string;
};
