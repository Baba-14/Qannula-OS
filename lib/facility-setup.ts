export type UnitCategory = "front_office" | "pre_analytical" | "analytical" | "post_analytical" | "governance";

export type FacilityUnit = {
  id: string;
  name: string;
  code: string;
  category: UnitCategory;
  enabled: boolean;
  lead: string;
  defaultTatMinutes?: number;
  seniorVerifierRequired?: boolean;
  required?: boolean;
};

export type SetupIssue = { unitId: string; message: string };

const requiredUnitIds = ["reception", "collection", "specimen_reception", "result_evaluation", "verification", "report_release", "audit", "tat", "qc", "inventory"];

export function validateFacilitySetup(units: FacilityUnit[]): SetupIssue[] {
  const issues: SetupIssue[] = [];
  const byId = new Map(units.map(unit => [unit.id, unit]));

  for (const unitId of requiredUnitIds) {
    if (!byId.get(unitId)?.enabled) issues.push({ unitId, message: "Required operational unit must be enabled" });
  }

  const activeLabs = units.filter(unit => unit.category === "analytical" && unit.enabled);
  if (activeLabs.length === 0) issues.push({ unitId: "analytical", message: "At least one analytical laboratory must be enabled" });

  for (const unit of activeLabs) {
    if (!unit.lead.trim()) issues.push({ unitId: unit.id, message: "Assign a qualified unit lead" });
    if (!unit.defaultTatMinutes || unit.defaultTatMinutes <= 0) issues.push({ unitId: unit.id, message: "Configure a positive default TAT" });
    if (!unit.seniorVerifierRequired) issues.push({ unitId: unit.id, message: "Senior scientist verification must be required" });
  }

  const duplicateCodes = units.filter(unit => unit.enabled).reduce<Record<string, number>>((counts, unit) => {
    counts[unit.code] = (counts[unit.code] ?? 0) + 1;
    return counts;
  }, {});
  for (const [code, count] of Object.entries(duplicateCodes)) {
    if (count > 1) issues.push({ unitId: code, message: `Unit code ${code} is duplicated` });
  }

  return issues;
}

export function setupCompletion(units: FacilityUnit[]): number {
  const enabled = units.filter(unit => unit.enabled);
  if (enabled.length === 0) return 0;
  const validEnabled = enabled.filter(unit => !validateFacilitySetup(units).some(issue => issue.unitId === unit.id));
  const requiredEnabled = requiredUnitIds.filter(id => units.find(unit => unit.id === id)?.enabled).length;
  return Math.round(((validEnabled.length / enabled.length) * 0.7 + (requiredEnabled / requiredUnitIds.length) * 0.3) * 100);
}
