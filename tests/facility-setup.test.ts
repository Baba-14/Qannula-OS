import { describe, expect, it } from "vitest";
import type { FacilityUnit } from "../lib/facility-setup";
import { setupCompletion, validateFacilitySetup } from "../lib/facility-setup";

const required = ["reception", "collection", "specimen_reception", "result_evaluation", "verification", "report_release", "audit", "tat", "qc", "inventory"];

function validUnits(): FacilityUnit[] {
  return [
    ...required.map(id => ({ id, name: id, code: id.slice(0, 4).toUpperCase(), category: (id === "reception" ? "front_office" : ["collection", "specimen_reception"].includes(id) ? "pre_analytical" : ["result_evaluation", "verification", "report_release"].includes(id) ? "post_analytical" : "governance") as FacilityUnit["category"], enabled: true, lead: "Responsible lead" })),
    { id: "haematology", name: "Haematology", code: "HM", category: "analytical", enabled: true, lead: "Senior Scientist", defaultTatMinutes: 120, seniorVerifierRequired: true },
  ];
}

describe("facility laboratory setup", () => {
  it("accepts a complete operational configuration", () => {
    const units = validUnits();
    expect(validateFacilitySetup(units)).toEqual([]);
    expect(setupCompletion(units)).toBe(100);
  });

  it("blocks publication when a required operational unit is disabled", () => {
    const units = validUnits().map(unit => unit.id === "qc" ? { ...unit, enabled: false } : unit);
    expect(validateFacilitySetup(units)).toContainEqual({ unitId: "qc", message: "Required operational unit must be enabled" });
  });

  it("requires each active laboratory unit to have leadership, TAT and senior verification", () => {
    const units = validUnits().map(unit => unit.id === "haematology" ? { ...unit, lead: "", defaultTatMinutes: 0, seniorVerifierRequired: false } : unit);
    const messages = validateFacilitySetup(units).filter(issue => issue.unitId === "haematology").map(issue => issue.message);
    expect(messages).toEqual(["Assign a qualified unit lead", "Configure a positive default TAT", "Senior scientist verification must be required"]);
  });

  it("rejects duplicate active unit codes", () => {
    const units = validUnits();
    units[1] = { ...units[1], code: units[0].code };
    expect(validateFacilitySetup(units).some(issue => issue.message.includes("duplicated"))).toBe(true);
  });
});
