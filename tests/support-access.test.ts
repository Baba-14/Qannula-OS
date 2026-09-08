import { describe, expect, it } from "vitest";
import { validateSupportAccess } from "../lib/support-access";

describe("controlled support access", () => {
  const valid = { facility: "Korle View Diagnostics", ticket: "SUP-2408", reason: "Investigate a confirmed interface synchronization incident.", scope: "technical_diagnostics" as const, durationMinutes: 30, approver: "Adwoa Frimpong", acknowledged: true };

  it("accepts a time-limited facility-approved support request", () => {
    expect(validateSupportAccess(valid)).toEqual([]);
  });

  it("rejects excessive access duration and missing governance evidence", () => {
    const issues = validateSupportAccess({ ...valid, ticket: "", reason: "help", durationMinutes: 120, approver: "", acknowledged: false });
    expect(issues).toContain("Enter a valid support ticket");
    expect(issues).toContain("Provide a detailed access reason");
    expect(issues).toContain("Support access must be between 1 and 60 minutes");
    expect(issues).toContain("Facility approval is required");
    expect(issues).toContain("Acknowledge monitoring and audit controls");
  });
});
