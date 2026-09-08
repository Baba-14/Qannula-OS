export type SpecimenStatus = "required" | "collected" | "received" | "accepted" | "rejected" | "quarantined" | "accessioned";
export type TestStatus = "ordered" | "pending" | "in_analysis" | "result_received" | "review" | "repeat" | "qc_hold" | "verified" | "released";

const specimenTransitions: Record<SpecimenStatus, SpecimenStatus[]> = {
  required: ["collected"], collected: ["received"], received: ["accepted", "rejected", "quarantined"],
  accepted: ["accessioned", "quarantined"], rejected: [], quarantined: ["accepted", "rejected"], accessioned: [],
};

const testTransitions: Record<TestStatus, TestStatus[]> = {
  ordered: ["pending"], pending: ["in_analysis", "qc_hold"], in_analysis: ["result_received", "repeat", "qc_hold"],
  result_received: ["review", "repeat", "qc_hold"], review: ["verified", "repeat", "qc_hold"],
  repeat: ["in_analysis"], qc_hold: ["in_analysis"], verified: ["released"], released: [],
};

export function canTransitionSpecimen(from: SpecimenStatus, to: SpecimenStatus): boolean {
  return specimenTransitions[from].includes(to);
}

export function canTransitionTest(from: TestStatus, to: TestStatus): boolean {
  return testTransitions[from].includes(to);
}

export function canApplyAnalyzerResult(input: { exactAccessionMatch: boolean; codeMapped: boolean; duplicate: boolean; qcPassed: boolean }): { allowed: boolean; reason: string } {
  if (input.duplicate) return { allowed: false, reason: "Duplicate analyzer message" };
  if (!input.exactAccessionMatch) return { allowed: false, reason: "No exact accession match" };
  if (!input.codeMapped) return { allowed: false, reason: "Analyzer code is not mapped" };
  if (!input.qcPassed) return { allowed: false, reason: "Applicable QC is not acceptable" };
  return { allowed: true, reason: "Safe to apply for technical review" };
}

export function canCloseCriticalNotification(input: { recipient: string; method: string; readBackConfirmed: boolean }): boolean {
  return Boolean(input.recipient.trim() && input.method.trim() && input.readBackConfirmed);
}
