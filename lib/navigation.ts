export type View =
  | "dashboard" | "orders" | "billing" | "collection" | "reception"
  | "allocations" | "worklist" | "microbiology" | "results" | "verification"
  | "critical" | "reports" | "catalogue" | "analyzers" | "interfaces"
  | "reconciliation" | "quality" | "equipment" | "referrals" | "inventory"
  | "patients" | "analytics" | "users" | "audit" | "facilities" | "facility"
  | "facility-setup" | "departments" | "test-config" | "references" | "critical-values"
  | "templates" | "integrations" | "settings" | "support" | "role-templates";

export type RoleId =
  | "main_admin" | "facility_admin" | "lab_manager" | "receptionist" | "phlebotomist"
  | "pre_lab_scientist" | "haematology_scientist" | "chemistry_scientist"
  | "microbiology_scientist" | "bench_scientist" | "verifier" | "quality_manager"
  | "interface_engineer" | "cashier_claims" | "specimen_courier" | "store_procurement"
  | "biomedical_officer" | "referral_coordinator" | "ordering_clinician"
  | "patient_portal" | "branch_admin" | "auditor" | "privacy_officer";

export type StationId = "pre-lab" | "haematology" | "chemistry" | "microbiology" | "post-lab" | "quality" | "cashier" | "courier" | "stores" | "biomedical" | "referrals" | "clinician" | "patient-portal" | "branch-admin" | "auditor" | "privacy";
export type NavItem = { id: View; icon: string; label: string };
export type NavGroup = { label: string; icon: string; items: NavItem[] };

export const allNavigation: NavGroup[] = [
  { label: "OVERVIEW", icon: "⌂", items: [{ id: "dashboard", icon: "⌂", label: "Dashboard" }] },
  { label: "PLATFORM", icon: "◇", items: [{ id: "facilities", icon: "◇", label: "Laboratory Network" }] },
  { label: "PATIENT SERVICES", icon: "♙", items: [
    { id: "patients", icon: "♙", label: "Patients" }, { id: "orders", icon: "▣", label: "Orders" },
    { id: "billing", icon: "¤", label: "Payment & Claims" },
  ] },
  { label: "PRE-LAB", icon: "♧", items: [
    { id: "collection", icon: "♧", label: "Collection" }, { id: "reception", icon: "▤", label: "Reception & Accession" },
  ] },
  { label: "LABORATORY UNITS", icon: "☷", items: [
    { id: "allocations", icon: "◫", label: "Work Allocation" }, { id: "worklist", icon: "☷", label: "Department Worklists" },
    { id: "results", icon: "◈", label: "Result Entry & Review" }, { id: "microbiology", icon: "◎", label: "Microbiology" },
  ] },
  { label: "POST-LAB", icon: "✓", items: [
    { id: "verification", icon: "✓", label: "Verification" }, { id: "critical", icon: "!", label: "Critical Results" },
    { id: "reports", icon: "▥", label: "Reports" },
  ] },
  { label: "QUALITY & RESOURCES", icon: "◒", items: [
    { id: "quality", icon: "◒", label: "Quality Control" }, { id: "equipment", icon: "▦", label: "Equipment" },
    { id: "inventory", icon: "□", label: "Inventory" }, { id: "referrals", icon: "↗", label: "Referrals" },
    { id: "analyzers", icon: "◌", label: "Analyzers" }, { id: "interfaces", icon: "↔", label: "Interface Monitor" },
    { id: "reconciliation", icon: "?", label: "Unmatched Results" },
  ] },
  { label: "MANAGEMENT", icon: "◩", items: [
    { id: "analytics", icon: "◩", label: "Analytics & TAT" }, { id: "users", icon: "♚", label: "Users & Assignments" },
    { id: "audit", icon: "◷", label: "Audit Trail" },
  ] },
  { label: "CONFIGURATION", icon: "⚙", items: [
    { id: "facility", icon: "⌂", label: "Facility & Branding" }, { id: "facility-setup", icon: "⊞", label: "Laboratory Setup" },
    { id: "role-templates", icon: "♚", label: "Roles & Dashboards" },
    { id: "departments", icon: "▦", label: "Departments & Benches" }, { id: "catalogue", icon: "⌘", label: "Test Catalogue" },
    { id: "test-config", icon: "⚙", label: "Test Configuration" }, { id: "references", icon: "↕", label: "Reference Intervals" },
    { id: "critical-values", icon: "!", label: "Critical Values" }, { id: "templates", icon: "▧", label: "Report Templates" },
    { id: "integrations", icon: "↔", label: "Integrations" }, { id: "settings", icon: "⚙", label: "System Settings" },
  ] },
];

const allViews = allNavigation.flatMap(group => group.items.map(item => item.id));

export const roleDefinitions: Record<RoleId, { label: string; name: string; scope: string; views: View[] }> = {
  main_admin: { label: "LabNett Software Owner", name: "Kofi Asante", scope: "Platform operations · No clinical access", views: ["dashboard", "facilities", "analytics", "role-templates", "catalogue", "integrations", "settings"] },
  facility_admin: { label: "Facility Administrator", name: "Adwoa Frimpong", scope: "Korle View Diagnostics · All units and branches", views: allViews.filter(view => view !== "facilities") },
  lab_manager: { label: "Laboratory Manager", name: "Akua Sarpong", scope: "LabNett Central · All laboratory units", views: allViews.filter(view => view !== "facilities" && view !== "role-templates") },
  receptionist: { label: "Receptionist", name: "Abena Osei", scope: "Main Branch · Reception & Accounts", views: ["dashboard", "patients", "orders", "billing", "collection", "reception", "reports"] },
  phlebotomist: { label: "Phlebotomist", name: "Mavis Owusu", scope: "Main Branch · Collection station", views: ["dashboard", "collection", "patients", "equipment", "inventory"] },
  pre_lab_scientist: { label: "Pre-Lab Scientist", name: "Yaw Ansah", scope: "Main Branch · Pre-analytical processing", views: ["dashboard", "collection", "reception", "worklist", "equipment", "inventory"] },
  haematology_scientist: { label: "Haematology Scientist", name: "Kojo Bediako", scope: "Main Branch · Haematology bench", views: ["dashboard", "worklist", "results", "quality", "equipment", "inventory"] },
  chemistry_scientist: { label: "Chemistry Scientist", name: "Selina Quaye", scope: "Main Branch · Clinical Chemistry bench", views: ["dashboard", "worklist", "results", "quality", "equipment", "inventory"] },
  microbiology_scientist: { label: "Microbiology Scientist", name: "Linda Nartey", scope: "Main Branch · Microbiology bench", views: ["dashboard", "worklist", "microbiology", "results", "quality", "equipment", "inventory"] },
  bench_scientist: { label: "Multi-Discipline Scientist", name: "Kojo Bediako", scope: "Main Branch · Assigned laboratory benches", views: ["dashboard", "allocations", "worklist", "results", "microbiology", "quality", "equipment", "inventory"] },
  verifier: { label: "Senior Laboratory Scientist", name: "Dr Esi Badu", scope: "Main Branch · Post-lab evaluation and verification", views: ["dashboard", "worklist", "results", "verification", "critical", "reports", "patients", "audit"] },
  quality_manager: { label: "Quality Manager", name: "Nana Adom", scope: "LabNett Central · Quality and compliance", views: ["dashboard", "allocations", "critical", "reports", "analytics", "quality", "equipment", "referrals", "inventory", "users", "audit", "references", "critical-values", "templates", "settings"] },
  interface_engineer: { label: "Interface Engineer", name: "Daniel Tetteh", scope: "All sites · Devices and interfaces", views: ["dashboard", "analyzers", "interfaces", "reconciliation", "quality", "equipment", "audit", "integrations"] },
  cashier_claims: { label: "Cashier / Claims Officer", name: "Nana Agyemang", scope: "Accra Main Branch · Finance only", views: ["dashboard", "billing"] },
  specimen_courier: { label: "Specimen Courier", name: "Kweku Addo", scope: "Korle View Diagnostics · Assigned routes", views: ["dashboard", "collection", "reception", "referrals"] },
  store_procurement: { label: "Store / Procurement Officer", name: "Kwaku Tetteh", scope: "Korle View Diagnostics · Stores and purchasing", views: ["dashboard", "inventory", "equipment", "audit"] },
  biomedical_officer: { label: "Biomedical / Equipment Officer", name: "Eyram Doku", scope: "Korle View Diagnostics · Equipment service", views: ["dashboard", "equipment", "analyzers", "quality", "audit"] },
  referral_coordinator: { label: "Referral Coordinator", name: "Adjoa Kusi", scope: "Korle View Diagnostics · Referral testing", views: ["dashboard", "referrals", "collection", "reception", "reports"] },
  ordering_clinician: { label: "Ordering Clinician", name: "Dr Ato Nyarko", scope: "Ridge Medical Ward · Own patients and orders", views: ["dashboard", "patients", "orders", "reports"] },
  patient_portal: { label: "Patient Portal User", name: "Ama Mensah", scope: "Personal account · Released records only", views: ["dashboard"] },
  branch_admin: { label: "Branch Administrator", name: "Yaa Owusu", scope: "East Legon Branch · Branch scope", views: ["dashboard", "patients", "orders", "billing", "collection", "reception", "allocations", "worklist", "results", "verification", "critical", "reports", "quality", "equipment", "referrals", "inventory", "analytics", "users", "audit", "facility"] },
  auditor: { label: "Read-Only Auditor", name: "Kwesi Amankwah", scope: "Approved evidence scope · Read only", views: ["dashboard", "analytics", "audit"] },
  privacy_officer: { label: "Privacy / Security Officer", name: "Naa Torshie", scope: "All sites · Privacy and access oversight", views: ["dashboard", "audit"] },
};

export const stationRoles: Record<StationId, RoleId> = {
  "pre-lab": "pre_lab_scientist",
  haematology: "haematology_scientist",
  chemistry: "chemistry_scientist",
  microbiology: "microbiology_scientist",
  "post-lab": "verifier",
  quality: "quality_manager",
  cashier: "cashier_claims",
  courier: "specimen_courier",
  stores: "store_procurement",
  biomedical: "biomedical_officer",
  referrals: "referral_coordinator",
  clinician: "ordering_clinician",
  "patient-portal": "patient_portal",
  "branch-admin": "branch_admin",
  auditor: "auditor",
  privacy: "privacy_officer",
};

export function navigationForRole(role: RoleId): NavGroup[] {
  const allowed = new Set(roleDefinitions[role].views);
  return allNavigation.map(group => ({ ...group, items: group.items.filter(item => allowed.has(item.id)) })).filter(group => group.items.length > 0);
}

export function canAccess(role: RoleId, view: View): boolean {
  return roleDefinitions[role].views.includes(view);
}
