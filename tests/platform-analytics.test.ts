import { describe, expect, it } from "vitest";
import { facilityPerformance, networkSummary, performanceCsv } from "../lib/platform-analytics";

describe("privacy-safe platform analytics", () => {
  it("calculates network totals and volume-weighted TAT performance", () => {
    const summary = networkSummary(facilityPerformance);
    expect(summary.facilities).toBe(5);
    expect(summary.sites).toBe(8);
    expect(summary.staff).toBe(91);
    expect(summary.testsToday).toBe(486);
    expect(summary.withinTatPercent).toBe(94);
  });

  it("exports facility performance without patient-level fields", () => {
    const csv = performanceCsv(facilityPerformance);
    expect(csv).toContain("Configured staff");
    expect(csv).toContain("Within TAT percent");
    expect(csv).toContain("Korle View Diagnostics");
    expect(csv).not.toContain("Patient");
    expect(csv.split("\n")).toHaveLength(facilityPerformance.length + 1);
  });
});
