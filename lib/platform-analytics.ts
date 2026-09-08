export type FacilityPerformance = {
  name: string;
  code: string;
  region: string;
  sites: number;
  configuredStaff: number;
  requiredStaff: number;
  departments: number;
  testsToday: number;
  medianTatMinutes: number;
  p95TatMinutes: number;
  withinTatPercent: number;
  qcState: "In control" | "Warning" | "Setup";
  uptimePercent: number;
};

export const facilityPerformance: FacilityPerformance[] = [
  { name: "LabNett Central", code: "LNC", region: "Greater Accra", sites: 3, configuredStaff: 34, requiredStaff: 36, departments: 8, testsToday: 186, medianTatMinutes: 48, p95TatMinutes: 188, withinTatPercent: 97, qcState: "Warning", uptimePercent: 99.98 },
  { name: "Korle View Diagnostics", code: "KVD", region: "Greater Accra", sites: 2, configuredStaff: 22, requiredStaff: 25, departments: 6, testsToday: 128, medianTatMinutes: 54, p95TatMinutes: 212, withinTatPercent: 95, qcState: "In control", uptimePercent: 99.92 },
  { name: "NorthStar Medical Lab", code: "NSM", region: "Northern", sites: 1, configuredStaff: 16, requiredStaff: 18, departments: 4, testsToday: 91, medianTatMinutes: 62, p95TatMinutes: 231, withinTatPercent: 93, qcState: "In control", uptimePercent: 99.86 },
  { name: "Aseda Community Laboratory", code: "ACL", region: "Ashanti", sites: 1, configuredStaff: 11, requiredStaff: 12, departments: 4, testsToday: 67, medianTatMinutes: 71, p95TatMinutes: 268, withinTatPercent: 89, qcState: "Warning", uptimePercent: 99.71 },
  { name: "Coastal Screening Centre", code: "CSC", region: "Central", sites: 1, configuredStaff: 8, requiredStaff: 14, departments: 2, testsToday: 14, medianTatMinutes: 86, p95TatMinutes: 294, withinTatPercent: 82, qcState: "Setup", uptimePercent: 98.94 },
];

export function facilityByCode(code: string): FacilityPerformance | undefined {
  return facilityPerformance.find(row => row.code.toLowerCase() === code.toLowerCase());
}

export function networkSummary(rows: FacilityPerformance[]) {
  const totals = rows.reduce((sum, row) => ({
    facilities: sum.facilities + 1,
    sites: sum.sites + row.sites,
    staff: sum.staff + row.configuredStaff,
    requiredStaff: sum.requiredStaff + row.requiredStaff,
    departments: sum.departments + row.departments,
    testsToday: sum.testsToday + row.testsToday,
    weightedTat: sum.weightedTat + row.withinTatPercent * row.testsToday,
  }), { facilities: 0, sites: 0, staff: 0, requiredStaff: 0, departments: 0, testsToday: 0, weightedTat: 0 });
  return { ...totals, withinTatPercent: totals.testsToday ? Math.round(totals.weightedTat / totals.testsToday) : 0 };
}

export function performanceCsv(rows: FacilityPerformance[]): string {
  const header = ["Facility", "Code", "Region", "Sites", "Configured staff", "Required staff", "Departments", "Tests today", "Median TAT minutes", "P95 TAT minutes", "Within TAT percent", "QC state", "Uptime percent"];
  const values = rows.map(row => [row.name, row.code, row.region, row.sites, row.configuredStaff, row.requiredStaff, row.departments, row.testsToday, row.medianTatMinutes, row.p95TatMinutes, row.withinTatPercent, row.qcState, row.uptimePercent]);
  return [header, ...values].map(columns => columns.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
