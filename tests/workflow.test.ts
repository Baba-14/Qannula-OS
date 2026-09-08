import { describe, expect, it } from "vitest";
import { canApplyAnalyzerResult, canCloseCriticalNotification, canTransitionSpecimen, canTransitionTest } from "../lib/workflow";

describe("specimen state safety", () => {
  it("allows reception to accept a received specimen", () => {
    expect(canTransitionSpecimen("received", "accepted")).toBe(true);
  });

  it("does not allow a required specimen to jump directly to accessioned", () => {
    expect(canTransitionSpecimen("required", "accessioned")).toBe(false);
  });

  it("does not change a rejected specimen through a generic status transition", () => {
    expect(canTransitionSpecimen("rejected", "accepted")).toBe(false);
  });
});

describe("test and analyzer result safety", () => {
  it("requires review before verification", () => {
    expect(canTransitionTest("review", "verified")).toBe(true);
    expect(canTransitionTest("result_received", "verified")).toBe(false);
  });

  it("holds unknown, unmapped, duplicate and QC-blocked analyzer results", () => {
    expect(canApplyAnalyzerResult({ exactAccessionMatch: false, codeMapped: true, duplicate: false, qcPassed: true }).allowed).toBe(false);
    expect(canApplyAnalyzerResult({ exactAccessionMatch: true, codeMapped: false, duplicate: false, qcPassed: true }).allowed).toBe(false);
    expect(canApplyAnalyzerResult({ exactAccessionMatch: true, codeMapped: true, duplicate: true, qcPassed: true }).allowed).toBe(false);
    expect(canApplyAnalyzerResult({ exactAccessionMatch: true, codeMapped: true, duplicate: false, qcPassed: false }).allowed).toBe(false);
  });

  it("allows an exact, mapped, non-duplicate result when QC passes", () => {
    expect(canApplyAnalyzerResult({ exactAccessionMatch: true, codeMapped: true, duplicate: false, qcPassed: true })).toEqual({ allowed: true, reason: "Safe to apply for technical review" });
  });
});

describe("critical-result closure", () => {
  it("requires recipient, contact method and read-back", () => {
    expect(canCloseCriticalNotification({ recipient: "Dr Nyarko", method: "Phone", readBackConfirmed: true })).toBe(true);
    expect(canCloseCriticalNotification({ recipient: "Dr Nyarko", method: "Phone", readBackConfirmed: false })).toBe(false);
    expect(canCloseCriticalNotification({ recipient: "", method: "Phone", readBackConfirmed: true })).toBe(false);
  });
});
