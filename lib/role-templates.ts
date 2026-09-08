export type RoleCategory = "Facility leadership" | "Patient services" | "Pre-lab" | "Laboratory" | "Post-lab" | "Quality & resources" | "External" | "Governance";
export type SubscriptionTier = "Core" | "Professional" | "Enterprise";

export type RoleTemplate = {
  id: string;
  name: string;
  category: RoleCategory;
  description: string;
  dashboard: string;
  widgets: string[];
  permissions: string[];
  tier: SubscriptionTier;
  facilities: number;
  staff: number;
  required?: boolean;
  safetyLocked?: boolean;
  status: "Published" | "Draft";
  version: number;
};

export const dashboardWidgets = ["Workload metrics", "Priority queue", "TAT monitor", "Staff coverage", "QC state", "Equipment health", "Inventory alerts", "Claims summary", "Branch comparison", "Audit evidence"];

export const roleTemplates: RoleTemplate[] = [
  { id: "facility_admin", name: "Facility Administrator", category: "Facility leadership", description: "Facility identity, branches, operating units, users and local configuration.", dashboard: "Facility operations", widgets: ["Workload metrics", "Staff coverage", "Branch comparison"], permissions: ["facility.configure", "user.assign", "role.activate"], tier: "Core", facilities: 5, staff: 8, required: true, safetyLocked: true, status: "Published", version: 3 },
  { id: "branch_admin", name: "Branch Administrator", category: "Facility leadership", description: "Operations, staffing and configuration restricted to one branch.", dashboard: "Branch operations", widgets: ["Workload metrics", "TAT monitor", "Staff coverage"], permissions: ["branch.manage", "staff.assign", "analytics.read"], tier: "Professional", facilities: 3, staff: 6, status: "Published", version: 2 },
  { id: "lab_manager", name: "Laboratory Manager", category: "Facility leadership", description: "Cross-unit workload, staffing, TAT and handover management.", dashboard: "Laboratory management", widgets: ["Workload metrics", "Priority queue", "TAT monitor", "Staff coverage"], permissions: ["work.allocate", "worklist.read_all", "analytics.read"], tier: "Core", facilities: 5, staff: 7, status: "Published", version: 4 },
  { id: "receptionist", name: "Receptionist", category: "Patient services", description: "Patient registration, order entry and specimen reception.", dashboard: "Reception desk", widgets: ["Workload metrics", "Priority queue"], permissions: ["patient.register", "order.create", "specimen.receive"], tier: "Core", facilities: 5, staff: 18, status: "Published", version: 3 },
  { id: "cashier_claims", name: "Cashier / Claims Officer", category: "Patient services", description: "Payments, insurer authorization, claims and reconciliation only.", dashboard: "Payment & claims", widgets: ["Claims summary", "Priority queue"], permissions: ["payment.record", "claim.manage", "receipt.issue"], tier: "Professional", facilities: 4, staff: 9, status: "Published", version: 1 },
  { id: "phlebotomist", name: "Phlebotomist", category: "Pre-lab", description: "Identity-safe collection and recollection work.", dashboard: "Collection station", widgets: ["Workload metrics", "Priority queue", "Inventory alerts"], permissions: ["collection.perform", "label.print", "recollection.record"], tier: "Core", facilities: 5, staff: 21, status: "Published", version: 3 },
  { id: "pre_lab_scientist", name: "Pre-Lab Scientist", category: "Pre-lab", description: "Reception, accession, processing, aliquoting and routing.", dashboard: "Pre-analytical workspace", widgets: ["Workload metrics", "Priority queue", "TAT monitor"], permissions: ["specimen.accept", "accession.create", "specimen.route"], tier: "Core", facilities: 5, staff: 12, status: "Published", version: 2 },
  { id: "specimen_courier", name: "Specimen Courier", category: "Pre-lab", description: "Pickup, transport conditions, dispatch and chain of custody.", dashboard: "Courier routes", widgets: ["Priority queue", "TAT monitor"], permissions: ["dispatch.collect", "transport.record", "handover.confirm"], tier: "Professional", facilities: 3, staff: 7, status: "Published", version: 1 },
  { id: "haematology_scientist", name: "Haematology Scientist", category: "Laboratory", description: "Haematology tests and assigned analyzer/manual benches.", dashboard: "Haematology bench", widgets: ["Workload metrics", "Priority queue", "TAT monitor", "QC state"], permissions: ["haematology.worklist", "result.enter", "repeat.request"], tier: "Core", facilities: 5, staff: 14, safetyLocked: true, status: "Published", version: 2 },
  { id: "chemistry_scientist", name: "Chemistry Scientist", category: "Laboratory", description: "Clinical chemistry tests and assigned analyzer/manual benches.", dashboard: "Chemistry bench", widgets: ["Workload metrics", "Priority queue", "TAT monitor", "QC state"], permissions: ["chemistry.worklist", "result.enter", "repeat.request"], tier: "Core", facilities: 5, staff: 13, safetyLocked: true, status: "Published", version: 2 },
  { id: "microbiology_scientist", name: "Microbiology Scientist", category: "Laboratory", description: "Culture, identification and susceptibility workflows.", dashboard: "Microbiology bench", widgets: ["Workload metrics", "Priority queue", "TAT monitor", "QC state"], permissions: ["microbiology.worklist", "culture.update", "result.enter"], tier: "Professional", facilities: 4, staff: 8, safetyLocked: true, status: "Published", version: 2 },
  { id: "bench_scientist", name: "Multi-Discipline Scientist", category: "Laboratory", description: "Assigned tests across approved departments in smaller facilities.", dashboard: "Assigned benches", widgets: ["Workload metrics", "Priority queue", "QC state"], permissions: ["assigned_worklist.read", "result.enter", "repeat.request"], tier: "Core", facilities: 3, staff: 11, safetyLocked: true, status: "Published", version: 3 },
  { id: "verifier", name: "Senior Laboratory Scientist", category: "Post-lab", description: "Evaluation, verification, critical communication and release.", dashboard: "Post-lab verification", widgets: ["Priority queue", "TAT monitor", "QC state"], permissions: ["result.evaluate", "result.verify", "report.release"], tier: "Core", facilities: 5, staff: 10, required: true, safetyLocked: true, status: "Published", version: 5 },
  { id: "quality_manager", name: "Quality Manager", category: "Quality & resources", description: "QC, incidents, CAPA, equipment and quality governance.", dashboard: "Quality & compliance", widgets: ["QC state", "Equipment health", "Audit evidence"], permissions: ["qc.manage", "capa.manage", "quality.audit"], tier: "Professional", facilities: 5, staff: 6, status: "Published", version: 3 },
  { id: "store_procurement", name: "Store / Procurement Officer", category: "Quality & resources", description: "Stock, suppliers, purchasing, lots and expiry.", dashboard: "Stores & procurement", widgets: ["Inventory alerts", "Priority queue"], permissions: ["stock.receive", "stock.issue", "purchase.request"], tier: "Professional", facilities: 4, staff: 8, status: "Published", version: 1 },
  { id: "biomedical_officer", name: "Biomedical / Equipment Officer", category: "Quality & resources", description: "Maintenance, calibration, downtime and service evidence.", dashboard: "Equipment services", widgets: ["Equipment health", "Priority queue", "Audit evidence"], permissions: ["equipment.maintain", "calibration.record", "downtime.manage"], tier: "Professional", facilities: 3, staff: 5, status: "Published", version: 1 },
  { id: "referral_coordinator", name: "Referral Coordinator", category: "Quality & resources", description: "External laboratory dispatch, tracking and returned results.", dashboard: "Referral coordination", widgets: ["Priority queue", "TAT monitor"], permissions: ["referral.create", "dispatch.manage", "referral.receive"], tier: "Professional", facilities: 4, staff: 6, status: "Published", version: 1 },
  { id: "interface_engineer", name: "Interface Engineer", category: "Quality & resources", description: "Analyzer connectivity, mappings and message reconciliation.", dashboard: "Interface operations", widgets: ["Equipment health", "Priority queue", "Audit evidence"], permissions: ["interface.inspect", "mapping.manage", "reconciliation.manage"], tier: "Enterprise", facilities: 3, staff: 4, status: "Published", version: 3 },
  { id: "ordering_clinician", name: "Ordering Clinician", category: "External", description: "Own-organization order requests and released reports.", dashboard: "Clinical client portal", widgets: ["Priority queue", "TAT monitor"], permissions: ["own_patient.search", "order.request", "own_report.read"], tier: "Professional", facilities: 4, staff: 42, safetyLocked: true, status: "Published", version: 1 },
  { id: "patient_portal", name: "Patient Portal User", category: "External", description: "Identity-verified access to personal released reports.", dashboard: "Patient portal", widgets: ["Priority queue"], permissions: ["own_report.read", "own_profile.manage"], tier: "Professional", facilities: 2, staff: 318, safetyLocked: true, status: "Published", version: 1 },
  { id: "auditor", name: "Read-Only Auditor", category: "Governance", description: "Time-limited read-only accreditation evidence.", dashboard: "Audit evidence", widgets: ["Audit evidence", "TAT monitor"], permissions: ["approved_evidence.read", "aggregate_analytics.read"], tier: "Enterprise", facilities: 2, staff: 3, safetyLocked: true, status: "Published", version: 1 },
  { id: "privacy_officer", name: "Privacy / Security Officer", category: "Governance", description: "Access review, privacy incidents and support-session audit.", dashboard: "Privacy & security", widgets: ["Audit evidence", "Priority queue"], permissions: ["access_review.read", "privacy_incident.manage", "support_audit.read"], tier: "Enterprise", facilities: 3, staff: 4, status: "Published", version: 1 },
];

export function validateRoleTemplate(template: Pick<RoleTemplate, "id" | "name" | "dashboard" | "widgets" | "permissions">): string[] {
  const issues: string[] = [];
  if (!/^[a-z][a-z0-9_]{2,39}$/.test(template.id)) issues.push("Role key must use lowercase letters, numbers and underscores");
  if (template.name.trim().length < 3) issues.push("Role name is required");
  if (template.dashboard.trim().length < 3) issues.push("Dashboard name is required");
  if (template.widgets.length === 0) issues.push("Select at least one dashboard widget");
  if (template.permissions.length === 0) issues.push("Add at least one permission");
  return issues;
}
