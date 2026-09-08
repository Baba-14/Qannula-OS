import { describe, expect, it } from "vitest";
import { canAccess, navigationForRole, roleDefinitions, stationRoles } from "../lib/navigation";

describe("role navigation", () => {
  it("limits the software owner to platform-facing views", () => {
    const visible = navigationForRole("main_admin").flatMap(group => group.items.map(item => item.id));
    expect(visible).toEqual(roleDefinitions.main_admin.views);
    expect(roleDefinitions.main_admin.label).toBe("LabNett Software Owner");
    expect(visible).toContain("facilities");
    expect(visible).toContain("role-templates");
    expect(visible).not.toContain("support");
    expect(visible).not.toContain("patients");
    expect(visible).not.toContain("orders");
    expect(visible).not.toContain("worklist");
    expect(visible).not.toContain("results");
    expect(visible).not.toContain("verification");
    expect(visible).not.toContain("users");
    expect(visible).not.toContain("audit");
  });

  it("gives a facility administrator operational and configuration access without platform network access", () => {
    expect(canAccess("facility_admin", "orders")).toBe(true);
    expect(canAccess("facility_admin", "facility")).toBe(true);
    expect(canAccess("facility_admin", "role-templates")).toBe(true);
    expect(canAccess("facility_admin", "facilities")).toBe(false);
    expect(canAccess("lab_manager", "role-templates")).toBe(false);
  });

  it("prevents reception from viewing analyzer configuration or verification", () => {
    expect(canAccess("receptionist", "orders")).toBe(true);
    expect(canAccess("receptionist", "billing")).toBe(true);
    expect(canAccess("receptionist", "analyzers")).toBe(false);
    expect(canAccess("receptionist", "verification")).toBe(false);
  });

  it("allows an authorized verifier to verify and manage critical results", () => {
    expect(canAccess("verifier", "verification")).toBe(true);
    expect(canAccess("verifier", "critical")).toBe(true);
    expect(roleDefinitions.verifier.label).toBe("Senior Laboratory Scientist");
    expect(canAccess("verifier", "test-config")).toBe(false);
    expect(canAccess("bench_scientist", "verification")).toBe(false);
  });

  it("restricts interface engineering to device and support context", () => {
    const views = navigationForRole("interface_engineer").flatMap(group => group.items.map(item => item.id));
    expect(views).toContain("reconciliation");
    expect(views).toContain("interfaces");
    expect(views).not.toContain("orders");
    expect(views).not.toContain("reports");
  });

  it("limits pre-lab staff to pre-analytical queues and resources", () => {
    expect(canAccess("pre_lab_scientist", "reception")).toBe(true);
    expect(canAccess("pre_lab_scientist", "worklist")).toBe(true);
    expect(canAccess("pre_lab_scientist", "results")).toBe(false);
    expect(canAccess("pre_lab_scientist", "verification")).toBe(false);
  });

  it("isolates analytical scientists to their assigned bench workflow", () => {
    expect(canAccess("chemistry_scientist", "worklist")).toBe(true);
    expect(canAccess("chemistry_scientist", "results")).toBe(true);
    expect(canAccess("chemistry_scientist", "orders")).toBe(false);
    expect(canAccess("chemistry_scientist", "verification")).toBe(false);
    expect(canAccess("microbiology_scientist", "microbiology")).toBe(true);
  });

  it("maps every direct station workspace to its configured account role", () => {
    expect(stationRoles["pre-lab"]).toBe("pre_lab_scientist");
    expect(stationRoles.haematology).toBe("haematology_scientist");
    expect(stationRoles.chemistry).toBe("chemistry_scientist");
    expect(stationRoles.microbiology).toBe("microbiology_scientist");
    expect(stationRoles["post-lab"]).toBe("verifier");
    expect(stationRoles.quality).toBe("quality_manager");
    expect(stationRoles.cashier).toBe("cashier_claims");
    expect(stationRoles.courier).toBe("specimen_courier");
    expect(stationRoles.stores).toBe("store_procurement");
    expect(stationRoles.biomedical).toBe("biomedical_officer");
    expect(stationRoles.referrals).toBe("referral_coordinator");
    expect(stationRoles.clinician).toBe("ordering_clinician");
    expect(stationRoles["patient-portal"]).toBe("patient_portal");
    expect(stationRoles["branch-admin"]).toBe("branch_admin");
    expect(stationRoles.auditor).toBe("auditor");
    expect(stationRoles.privacy).toBe("privacy_officer");
  });

  it("keeps added operational roles within their responsibilities", () => {
    expect(canAccess("cashier_claims", "billing")).toBe(true);
    expect(canAccess("cashier_claims", "orders")).toBe(false);
    expect(canAccess("cashier_claims", "results")).toBe(false);
    expect(canAccess("store_procurement", "inventory")).toBe(true);
    expect(canAccess("store_procurement", "patients")).toBe(false);
    expect(canAccess("biomedical_officer", "equipment")).toBe(true);
    expect(canAccess("biomedical_officer", "verification")).toBe(false);
    expect(canAccess("auditor", "audit")).toBe(true);
    expect(canAccess("auditor", "results")).toBe(false);
    expect(roleDefinitions.patient_portal.views).toEqual(["dashboard"]);
  });
});
