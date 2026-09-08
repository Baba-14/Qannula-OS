"use client";

import { useMemo, useState } from "react";
import type { View } from "../lib/navigation";

type Tone = "green" | "amber" | "red" | "blue" | "gray";
type Metric = [string, string, string, Tone];
type Cell = string | { label: string; tone: Tone };

type ScreenSpec = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: string;
  secondary?: string;
  metrics: Metric[];
  filters: string[];
  columns: string[];
  rows: Cell[][];
};

type FormField = { name: string; label: string; type?: "text" | "email" | "number" | "date" | "time" | "color" | "textarea" | "select"; required?: boolean; placeholder?: string; options?: string[] };

const commonFields: FormField[] = [
  { name: "name", label: "Name / title", required: true, placeholder: "Enter a clear name" },
  { name: "code", label: "Code / identifier", required: true, placeholder: "Unique code" },
  { name: "facility", label: "Facility", type: "select", required: true, options: ["Korle View Diagnostics", "LabNett Central", "NorthStar Medical Lab"] },
  { name: "notes", label: "Notes and governance rationale", type: "textarea", placeholder: "Describe purpose, source, approvals or operating rules" },
];

const formSchemas: Partial<Record<View, FormField[]>> = {
  users: [
    { name: "name", label: "Full name", required: true, placeholder: "e.g. Ama Owusu" }, { name: "email", label: "Work email", type: "email", required: true, placeholder: "name@facility.org" },
    { name: "role", label: "Activated role template", type: "select", required: true, options: ["Receptionist", "Cashier / Claims Officer", "Phlebotomist", "Pre-Lab Scientist", "Specimen Courier", "Haematology Scientist", "Chemistry Scientist", "Microbiology Scientist", "Multi-Discipline Scientist", "Senior Laboratory Scientist", "Quality Manager", "Store / Procurement Officer", "Biomedical / Equipment Officer", "Referral Coordinator", "Laboratory Manager", "Branch Administrator", "Facility Administrator"] },
    { name: "facility", label: "Facility", type: "select", required: true, options: ["Korle View Diagnostics", "LabNett Central", "NorthStar Medical Lab"] },
    { name: "site", label: "Site / branch", type: "select", required: true, options: ["Accra Main Branch", "East Legon Branch", "All facility branches"] },
    { name: "unit", label: "Assigned unit / station", type: "select", required: true, options: ["Reception & Accounts", "Claims Desk", "Collection", "Pre-lab Processing", "Courier Routes", "Haematology", "Clinical Chemistry", "Microbiology", "Post-lab Verification", "Quality & Compliance", "Stores & Procurement", "Equipment Services", "Referral Coordination", "Clinical Client Portal", "Patient Portal", "Audit Evidence", "Privacy & Security", "All Laboratory Units"] },
    { name: "shift", label: "Default shift", type: "select", options: ["Day · 08:00–16:00", "Evening · 16:00–00:00", "Night · 00:00–08:00", "Rotating"] },
    { name: "approval", label: "Clinical authorization", type: "select", options: ["No result authorization", "Technical review", "Senior verification & release"] },
  ],
  catalogue: [
    { name: "name", label: "Test / panel name", required: true }, { name: "code", label: "LabNett code", required: true }, { name: "discipline", label: "Discipline", type: "select", required: true, options: ["Haematology", "Clinical Chemistry", "Microbiology", "Serology & Immunology", "Parasitology", "Molecular Diagnostics", "Urinalysis"] },
    { name: "resultType", label: "Result type", type: "select", required: true, options: ["Numeric", "Qualitative", "Panel", "Text", "Microscopy", "Microbiology"] }, { name: "specimen", label: "Specimen", required: true }, { name: "loinc", label: "LOINC (optional)" }, { name: "notes", label: "Clinical definition", type: "textarea" },
  ],
  analyzers: [
    { name: "name", label: "Analyzer name", required: true }, { name: "serial", label: "Serial number", required: true }, { name: "department", label: "Laboratory unit", type: "select", required: true, options: ["Haematology", "Clinical Chemistry", "Microbiology", "Immunology", "Urinalysis"] },
    { name: "protocol", label: "Connection protocol", type: "select", required: true, options: ["ASTM · TCP/IP", "HL7 · TCP/IP", "Serial", "File import", "Manual"] }, { name: "gateway", label: "Device gateway" }, { name: "notes", label: "Validation notes", type: "textarea" },
  ],
  quality: [
    { name: "control", label: "Control material / level", required: true }, { name: "analyzer", label: "Analyzer", required: true }, { name: "lot", label: "Lot number", required: true }, { name: "test", label: "Analyte", required: true },
    { name: "result", label: "Observed result", type: "number", required: true }, { name: "mean", label: "Assigned mean", type: "number", required: true }, { name: "sd", label: "Standard deviation", type: "number", required: true }, { name: "notes", label: "Observation / corrective action", type: "textarea" },
  ],
  equipment: [
    { name: "name", label: "Equipment name", required: true }, { name: "asset", label: "Asset ID", required: true }, { name: "serial", label: "Serial number", required: true }, { name: "unit", label: "Assigned unit", required: true },
    { name: "manufacturer", label: "Manufacturer" }, { name: "service", label: "Next service date", type: "date", required: true }, { name: "notes", label: "Installation / maintenance notes", type: "textarea" },
  ],
  inventory: [
    { name: "item", label: "Item / reagent", required: true }, { name: "lot", label: "Lot number", required: true }, { name: "unit", label: "Laboratory unit", required: true }, { name: "quantity", label: "Quantity received", type: "number", required: true },
    { name: "expiry", label: "Expiry date", type: "date", required: true }, { name: "supplier", label: "Supplier" }, { name: "notes", label: "Storage and receipt notes", type: "textarea" },
  ],
  patients: [
    { name: "firstName", label: "First name", required: true }, { name: "lastName", label: "Last name", required: true }, { name: "dob", label: "Date of birth", type: "date", required: true }, { name: "sex", label: "Sex", type: "select", required: true, options: ["Female", "Male", "Other / not stated"] },
    { name: "phone", label: "Phone number" }, { name: "identifier", label: "National / hospital ID" }, { name: "address", label: "Address", type: "textarea" },
  ],
  departments: [
    { name: "name", label: "Department / bench name", required: true }, { name: "code", label: "Routing code", required: true }, { name: "lead", label: "Qualified lead", required: true }, { name: "tat", label: "Default TAT (minutes)", type: "number", required: true },
    { name: "hours", label: "Operating hours", required: true, placeholder: "08:00–20:00" }, { name: "verification", label: "Verification policy", type: "select", required: true, options: ["Senior verification required", "Technical review + senior verification"] }, { name: "notes", label: "Routing and bench notes", type: "textarea" },
  ],
  "test-config": [
    { name: "test", label: "Master test", type: "select", required: true, options: ["Full Blood Count", "Serum Creatinine", "Renal Function", "HbA1c", "Urine Culture"] }, { name: "localCode", label: "Local code", required: true }, { name: "department", label: "Laboratory unit", required: true },
    { name: "price", label: "Price (GHS)", type: "number", required: true }, { name: "tat", label: "TAT (minutes)", type: "number", required: true }, { name: "method", label: "Method", required: true }, { name: "analyzer", label: "Analyzer / manual bench" }, { name: "notes", label: "Release and reporting rules", type: "textarea" },
  ],
  references: [
    { name: "test", label: "Test / analyte", required: true }, { name: "method", label: "Method", required: true }, { name: "unit", label: "Reporting unit", required: true }, { name: "sex", label: "Sex partition", type: "select", options: ["All", "Female", "Male"] },
    { name: "ageMin", label: "Minimum age", type: "number" }, { name: "ageMax", label: "Maximum age", type: "number" }, { name: "lower", label: "Lower limit", type: "number", required: true }, { name: "upper", label: "Upper limit", type: "number", required: true }, { name: "source", label: "Clinical source / approval", type: "textarea", required: true },
  ],
  "critical-values": [
    { name: "test", label: "Test / analyte", required: true }, { name: "unit", label: "Reporting unit", required: true }, { name: "low", label: "Critical low", type: "number" }, { name: "high", label: "Critical high", type: "number" },
    { name: "target", label: "Contact target (minutes)", type: "number", required: true }, { name: "escalation", label: "Escalation policy", type: "textarea", required: true }, { name: "source", label: "Clinical approval / source", type: "textarea", required: true },
  ],
  templates: [
    { name: "name", label: "Template name", required: true }, { name: "facility", label: "Facility", required: true }, { name: "reportType", label: "Report type", type: "select", options: ["General laboratory", "Microbiology", "Histopathology", "Screening programme"] }, { name: "brand", label: "Brand colour", type: "color" },
    { name: "header", label: "Report header", type: "textarea" }, { name: "footer", label: "Report footer and disclaimer", type: "textarea" },
  ],
  integrations: [
    { name: "name", label: "Integration name", required: true }, { name: "type", label: "Type", type: "select", required: true, options: ["HIS / EMR", "Analyzer gateway", "Result destination", "Claims provider", "SMS / email"] }, { name: "endpoint", label: "Endpoint / host", required: true },
    { name: "auth", label: "Authentication", type: "select", options: ["OAuth 2.0", "API key", "mTLS", "Username / password", "Local trusted gateway"] }, { name: "notes", label: "Mapping and security notes", type: "textarea" },
  ],
  settings: [
    { name: "identifier", label: "Accession prefix", required: true, placeholder: "KVD" }, { name: "timezone", label: "Timezone", type: "select", options: ["Africa/Accra", "UTC"] }, { name: "locale", label: "Language / locale", type: "select", options: ["English (Ghana)", "English (International)"] },
    { name: "session", label: "Session timeout (minutes)", type: "number", required: true }, { name: "offline", label: "Offline queue policy", type: "select", options: ["Local queue with supervised sync", "Online only"] }, { name: "notes", label: "Change reason", type: "textarea", required: true },
  ],
};

const badge = (label: string, tone: Tone): Cell => ({ label, tone });

const screens: Partial<Record<View, ScreenSpec>> = {
  facilities: {
    eyebrow: "Platform administration", title: "Laboratory network", subtitle: "Govern facilities, sites, subscriptions and implementation readiness across LabNett.", primary: "Add facility", secondary: "Onboarding checklist",
    metrics: [["Facilities", "4", "3 live · 1 onboarding", "blue"], ["Active sites", "7", "Across 3 regions", "green"], ["Platform users", "86", "74 active this month", "blue"], ["Open risks", "3", "2 integrations · 1 validation", "amber"]],
    filters: ["All facility states", "All regions"], columns: ["Facility", "Sites", "Administrator", "Implementation", "Connectivity", "Status"],
    rows: [["LabNett Central", "3", "Kofi Asante", "Production", "All gateways healthy", badge("Live", "green")], ["Korle View Diagnostics", "2", "Adwoa Frimpong", "Validation", "1 gateway warning", badge("Validation", "amber")], ["NorthStar Medical Lab", "1", "Issah Abdulai", "Production", "Online", badge("Live", "green")], ["Coastal Screening Centre", "1", "Esi Badu", "Catalogue setup", "Not connected", badge("Onboarding", "blue")]],
  },
  critical: {
    eyebrow: "Clinical safety", title: "Critical result workspace", subtitle: "Track notification, read-back and escalation until every critical result is safely closed.", primary: "Open escalation policy",
    metrics: [["Open", "2", "Both require action", "red"], ["Past target", "1", "Escalate immediately", "red"], ["Closed today", "7", "Median contact 8 min", "green"], ["Read-back rate", "100%", "Required for closure", "green"]],
    filters: ["Open notifications", "All departments", "All severities"], columns: ["Patient / accession", "Critical result", "Requester", "Detected", "Elapsed", "Contact status"],
    rows: [["Nana Yeboah · CH-260908-00412", "Potassium 7.8 mmol/L", "Dr A. Nyarko · Medical Ward", "11:14", "18 min", badge("2 attempts", "red")], ["Akosua Darko · HM-260908-01560", "Haemoglobin 5.1 g/dL", "Dr E. Lartey · OPD", "11:26", "6 min", badge("Contacting", "amber")], ["Kweku Addo · CH-260908-00398", "Glucose 2.1 mmol/L", "Dr S. Tetteh · Emergency", "10:42", "Closed 10:49", badge("Read-back complete", "green")]],
  },
  catalogue: {
    eyebrow: "Laboratory / catalogue", title: "Master test catalogue", subtitle: "Govern standardized test definitions and activate them safely for each facility.", primary: "Create test definition", secondary: "Import catalogue",
    metrics: [["Test definitions", "1,284", "1,196 active", "blue"], ["Panels", "143", "Version controlled", "green"], ["LOINC mapped", "91%", "112 mappings pending", "amber"], ["Draft changes", "8", "Awaiting approval", "amber"]],
    filters: ["All disciplines", "All result types", "Active and draft"], columns: ["Test", "LabNett code", "Discipline", "Result type", "Specimen", "LOINC", "Status"],
    rows: [["Full Blood Count", "FBC_PANEL_001", "Haematology", "Panel · 8 components", "EDTA whole blood", "58410-2", badge("Active", "green")], ["Serum Creatinine", "CHEM_CREAT", "Chemistry", "Numeric", "Serum / plasma", "2160-0", badge("Active", "green")], ["HbA1c", "CHEM_HBA1C", "Chemistry", "Numeric", "EDTA whole blood", "4548-4", badge("Active", "green")], ["Malaria Microscopy", "PARA_MAL_MIC", "Parasitology", "Microscopy", "EDTA blood", "—", badge("Mapping review", "amber")]],
  },
  analyzers: {
    eyebrow: "Laboratory / devices", title: "Analyzer registry", subtitle: "Monitor device identity, connection state, validation and laboratory assignment.", primary: "Add analyzer", secondary: "Gateway health",
    metrics: [["Registered", "8", "7 active", "blue"], ["Online", "6", "Last check under 1 min", "green"], ["QC hold", "1", "Sysmex XN-330", "amber"], ["Interface errors", "1", "Needs investigation", "red"]],
    filters: ["All device states", "All departments", "All sites"], columns: ["Analyzer", "Department", "Connection", "Gateway", "Last communication", "Status"],
    rows: [["Sysmex XN-330 · SN XN330-9214", "Haematology", "ASTM · TCP/IP", "GW-ACCRA-01", "34 sec ago", badge("QC hold", "amber")], ["Mindray BS-240 · SN BS24-4418", "Chemistry", "HL7 · TCP/IP", "GW-ACCRA-01", "12 sec ago", badge("Online", "green")], ["Finecare FIA Meter", "Immunology", "File import", "GW-ACCRA-02", "8 min ago", badge("Online", "green")], ["Urit 50 Urinalysis", "Urinalysis", "Serial", "GW-ACCRA-02", "42 min ago", badge("Interface error", "red")]],
  },
  interfaces: {
    eyebrow: "Integration operations", title: "Interface monitor", subtitle: "Follow each analyzer message from receipt through parsing, mapping, matching and application.", primary: "Open unmatched queue", secondary: "Download logs",
    metrics: [["Messages today", "2,941", "99.4% applied", "green"], ["Queue depth", "14", "Sync retry active", "amber"], ["Failed", "4", "Requires investigation", "red"], ["Unmatched", "2", "Never auto-assigned", "red"]],
    filters: ["All analyzers", "All message states", "Last 24 hours"], columns: ["Time", "Analyzer", "Sample ID", "Parse", "Mapping", "Match", "Applied", "Status"],
    rows: [["11:31:42", "Mindray BS-240", "CH-260908-00418", badge("Passed", "green"), badge("Passed", "green"), badge("Exact", "green"), "12 results", badge("Applied", "green")], ["11:28:16", "Sysmex XN-330", "HM-260908-01561", badge("Passed", "green"), badge("Passed", "green"), badge("Exact", "green"), "Held", badge("QC hold", "amber")], ["11:22:09", "Urit 50", "UR-558812", badge("Passed", "green"), badge("1 unmapped", "red"), "No order", "0 results", badge("Unmatched", "red")], ["11:17:54", "Mindray BS-240", "CH-260908-00411", badge("Failed", "red"), "—", "—", "0 results", badge("Parse error", "red")]],
  },
  quality: {
    eyebrow: "Quality management", title: "Quality control", subtitle: "See control performance, failures and corrective actions before patient testing continues.", primary: "Enter QC result", secondary: "Record corrective action",
    metrics: [["Analyzers in control", "6 / 7", "One QC hold", "amber"], ["Controls due", "3", "Within next 2 hours", "amber"], ["Failed today", "1", "Corrective action open", "red"], ["Reviews complete", "94%", "31 of 33 reviewed", "green"]],
    filters: ["All analyzers", "All QC states", "Current lot"], columns: ["Control / level", "Analyzer", "Lot", "Expected mean", "Current", "SD index", "Status"],
    rows: [["XN CHECK Level 1", "Sysmex XN-330", "XNQ-2607", "WBC 6.10", "6.18", "+0.4 SD", badge("Passed", "green")], ["XN CHECK Level 2", "Sysmex XN-330", "XNQ-2607", "HGB 13.4", "15.1", "+3.2 SD", badge("Failed", "red")], ["Chem Control N", "Mindray BS-240", "CCN-1182", "CREA 88", "90", "+0.3 SD", badge("Passed", "green")], ["Chem Control P", "Mindray BS-240", "CCP-1183", "GLU 15.2", "15.0", "-0.2 SD", badge("Passed", "green")]],
  },
  equipment: {
    eyebrow: "Assets and maintenance", title: "Equipment registry", subtitle: "Manage maintenance, calibration, downtime and service history for laboratory equipment.", primary: "Register equipment", secondary: "Maintenance calendar",
    metrics: [["Equipment", "31", "28 operational", "blue"], ["Maintenance due", "4", "Within 14 days", "amber"], ["Calibration due", "2", "Before next run", "red"], ["Downtime this month", "6.4 h", "Across 3 devices", "amber"]],
    filters: ["All equipment states", "All departments", "All sites"], columns: ["Equipment", "Department", "Last maintenance", "Next maintenance", "Calibration", "Status"],
    rows: [["Sysmex XN-330", "Haematology", "12 Aug 2026", "12 Nov 2026", "Valid to 30 Sep", badge("QC hold", "amber")], ["Mindray BS-240", "Chemistry", "22 Jul 2026", "22 Oct 2026", "Valid to 15 Oct", badge("Operational", "green")], ["Hettich Rotina 380", "Processing", "05 Jun 2026", "05 Sep 2026", "Not applicable", badge("Overdue", "red")], ["Biosafety Cabinet II", "Microbiology", "18 Aug 2026", "18 Feb 2027", "Valid", badge("Operational", "green")]],
  },
  referrals: {
    eyebrow: "Advanced laboratory", title: "Referral testing", subtitle: "Track specimens sent to external laboratories through dispatch, return, verification and release.", primary: "Create referral dispatch", secondary: "Manage referral labs",
    metrics: [["Awaiting dispatch", "6", "Next courier at 14:00", "amber"], ["In transit / testing", "18", "Across 3 partners", "blue"], ["Results returned", "4", "Awaiting verification", "green"], ["Past expected TAT", "2", "Follow up required", "red"]],
    filters: ["All referral states", "All referral labs", "All tests"], columns: ["Patient / test", "Specimen", "Referral laboratory", "Dispatched", "Expected", "External accession", "Status"],
    rows: [["Naa Adjeley · ANA Screen", "Serum · SPC-01531", "MedLab Reference", "08 Sep · 09:10", "10 Sep", "MLR-88231", badge("Testing", "blue")], ["Yaw Mensah · Viral Load", "EDTA plasma · SPC-01488", "National Reference Lab", "07 Sep · 14:22", "12 Sep", "NRL-260944", badge("Received", "green")], ["Afia Serwaa · Histopathology", "Tissue · SPC-01391", "PathCare Ghana", "04 Sep · 11:05", "08 Sep", "PCG-11902", badge("TAT breach", "red")]],
  },
  inventory: {
    eyebrow: "Laboratory resources", title: "Inventory", subtitle: "Monitor reagents, controls and consumables by site, lot, expiry and reorder threshold.", primary: "Receive stock", secondary: "Create purchase request",
    metrics: [["Stock items", "214", "Across 7 sites", "blue"], ["Below reorder", "9", "3 are critical", "red"], ["Expiring in 30 days", "12", "Review usage plan", "amber"], ["Open requests", "5", "GHS 18,420 value", "blue"]],
    filters: ["All stock states", "All categories", "Main Branch"], columns: ["Item", "Category", "Lot", "Expires", "On hand", "Reorder level", "Status"],
    rows: [["Cellpack DCL", "Haematology reagent", "CP-26044", "12 Dec 2026", "8 × 20 L", "4", badge("In stock", "green")], ["Stromatolyser-FB", "Haematology reagent", "SF-26118", "28 Oct 2026", "2 × 5 L", "3", badge("Reorder", "red")], ["EDTA K2 tubes", "Consumable", "ED-88310", "30 Jun 2028", "1,240", "500", badge("In stock", "green")], ["Chem Control P", "QC material", "CCP-1183", "25 Sep 2026", "3 vials", "2", badge("Expiring", "amber")]],
  },
  patients: {
    eyebrow: "Management / patients", title: "Patient directory", subtitle: "Search longitudinal laboratory records while preventing duplicate registration.", primary: "Register patient", secondary: "Potential duplicates",
    metrics: [["Patients", "18,492", "Across current facility", "blue"], ["New today", "47", "6 from external HIS", "green"], ["Potential duplicates", "5", "Review before merge", "amber"], ["Open orders", "112", "23 marked STAT", "blue"]],
    filters: ["All patient states", "All sites", "Last 12 months"], columns: ["Patient", "Identifiers", "Contact", "Last visit", "Open orders", "Record status"],
    rows: [["Ama Mensah · 34 years · F", "PAT-00291 · HOSP-11842", "+233 24 555 0188", "08 Sep 2026", "1", badge("Active", "green")], ["Kwame Boateng · 61 years · M", "PAT-00882 · HOSP-30817", "+233 20 218 4410", "08 Sep 2026", "1", badge("Active", "green")], ["Efua Ofori · 27 years · F", "PAT-00411", "+233 55 802 1194", "08 Sep 2026", "1", badge("Identity review", "amber")], ["Kojo Nyarko · 42 years · M", "PAT-00490 · NHIS-99201", "+233 27 114 2008", "03 Aug 2026", "0", badge("Active", "green")]],
  },
  analytics: {
    eyebrow: "Management intelligence", title: "Laboratory analytics", subtitle: "Monitor TAT, volume, rejections, workload, analyzer performance and quality without exposing unnecessary patient data.", primary: "Export dashboard", secondary: "Schedule report",
    metrics: [["Median TAT", "54 min", "Down 8 min this week", "green"], ["P95 TAT", "3 h 18 m", "Target under 4 hours", "green"], ["Test volume", "6,842", "+9.4% this month", "blue"], ["Rejection rate", "1.8%", "Target below 2.0%", "green"]],
    filters: ["Last 30 days", "All facilities", "All departments"], columns: ["Department", "Tests", "Median TAT", "P95 TAT", "Rejections", "Within target"],
    rows: [["Haematology", "2,814", "42 min", "1 h 51 min", "1.2%", badge("97%", "green")], ["Chemistry", "2,402", "68 min", "3 h 32 min", "1.6%", badge("94%", "green")], ["Microbiology", "612", "38 h", "76 h", "2.7%", badge("89%", "amber")], ["Serology / Immunology", "1,014", "91 min", "4 h 12 min", "2.1%", badge("91%", "amber")]],
  },
  users: {
    eyebrow: "Identity and access", title: "Users & roles", subtitle: "Control atomic permissions by facility, site, department and clinical responsibility.", primary: "Invite user", secondary: "Create role",
    metrics: [["Users", "86", "79 active", "blue"], ["Clinical verifiers", "14", "Across 7 sites", "green"], ["Pending invites", "4", "Expire in 48 hours", "amber"], ["Access reviews due", "7", "Quarterly review", "red"]],
    filters: ["All user states", "All roles", "All facilities"], columns: ["User", "Role", "Facility / scope", "Department", "Last login", "Status"],
    rows: [["Kofi Asante · k.asante@labnett.demo", "LabNett Software Owner", "Platform", "No clinical department", "Now", badge("Active", "green")], ["Mavis Owusu · m.owusu@labnett.demo", "Phlebotomist", "LabNett Central", "Collection", "11:26", badge("Active", "green")], ["Dr Esi Badu · e.badu@labnett.demo", "Senior Laboratory Scientist", "Main Branch", "Chemistry", "10:58", badge("Active", "green")], ["Daniel Tetteh · d.tetteh@labnett.demo", "Interface Engineer", "All sites", "Devices & interfaces", "Yesterday", badge("Review due", "amber")]],
  },
  audit: {
    eyebrow: "Governance and traceability", title: "Audit explorer", subtitle: "Inspect immutable clinical, configuration and access events with before-and-after context.", primary: "Export audit evidence",
    metrics: [["Events today", "8,491", "All services healthy", "blue"], ["Clinical changes", "142", "100% attributed", "green"], ["Config changes", "17", "4 approvals pending", "amber"], ["Security alerts", "1", "Failed access scoped", "red"]],
    filters: ["All event types", "All users", "Today"], columns: ["Time", "Actor", "Action", "Entity", "Facility", "Outcome"],
    rows: [["11:32:04", "Kofi Asante", "result.verify", "HM-260908-01552 · FBC", "LabNett Central", badge("Succeeded", "green")], ["11:28:18", "Gateway service", "interface.result.hold", "HM-260908-01561", "LabNett Central", badge("QC hold", "amber")], ["11:16:40", "Daniel Tetteh", "analyzer.mapping.update", "Urit 50 · LEU", "Main Branch", badge("Approval required", "amber")], ["10:51:12", "Unknown user", "patient.read.denied", "PAT-00411", "Korle View", badge("Denied", "red")]],
  },
  facility: {
    eyebrow: "Configuration", title: "Facility profile", subtitle: "Manage legal identity, sites, branding, contacts and laboratory governance settings.", primary: "Save changes", secondary: "Preview branding",
    metrics: [["Sites", "3", "All operational", "green"], ["Departments", "8", "7 active", "blue"], ["Accreditation", "ISO 15189", "Valid to Dec 2027", "green"], ["Configuration", "v14", "Published 02 Sep", "blue"]],
    filters: ["Facility overview", "Main Branch"], columns: ["Configuration area", "Current value", "Owner", "Last updated", "Approval", "Status"],
    rows: [["Legal identity", "LabNett Central Diagnostic Laboratory Ltd", "Facility Administrator", "02 Sep 2026", "Approved", badge("Complete", "green")], ["Report branding", "Logo · header · footer · signature policy", "Quality Manager", "29 Aug 2026", "Approved", badge("Published", "green")], ["Accession format", "{DEPT}-{YYMMDD}-{SEQ5}", "System Administrator", "17 Aug 2026", "Approved", badge("Active", "green")], ["Downtime policy", "Local queue + manual continuity procedure", "Quality Manager", "08 Jul 2026", "Review due", badge("Review", "amber")]],
  },
  departments: {
    eyebrow: "Configuration", title: "Departments", subtitle: "Configure benches, routing, operating hours, verification policy and department-level TAT.", primary: "Add department",
    metrics: [["Departments", "8", "7 active", "blue"], ["Benches", "14", "Across 3 sites", "green"], ["Routing exceptions", "2", "Need correction", "amber"], ["TAT policies", "21", "All versioned", "green"]],
    filters: ["All department states", "All sites"], columns: ["Department", "Code", "Sites", "Benches", "Target TAT", "Verifier policy", "Status"],
    rows: [["Haematology", "HM", "3", "3", "Routine 2 h · STAT 45 m", "Authorized scientist", badge("Active", "green")], ["Clinical Chemistry", "CH", "3", "4", "Routine 4 h · STAT 60 m", "Authorized scientist", badge("Active", "green")], ["Microbiology", "MB", "2", "3", "Test dependent", "Senior microbiologist", badge("Active", "green")], ["Molecular Diagnostics", "MD", "1", "1", "Test dependent", "Pathologist", badge("Setup", "amber")]],
  },
  "test-config": {
    eyebrow: "Configuration / facility catalogue", title: "Test configuration", subtitle: "Activate master tests and apply local prices, TAT, specimens, methods, analyzers and report rules.", primary: "Activate tests", secondary: "Bulk configuration",
    metrics: [["Active tests", "386", "From 1,284 master tests", "blue"], ["Fully configured", "371", "96.1% ready", "green"], ["Missing references", "9", "Cannot auto-release", "red"], ["Draft changes", "6", "Awaiting approval", "amber"]],
    filters: ["All configuration states", "All departments", "All methods"], columns: ["Facility test", "Local code", "Department", "Method / analyzer", "Price", "TAT", "Configuration"],
    rows: [["Full Blood Count", "FBC", "Haematology", "Impedance · Sysmex XN-330", "GHS 85", "2 h", badge("Ready", "green")], ["Serum Creatinine", "CREA", "Chemistry", "Enzymatic · Mindray BS-240", "GHS 55", "4 h", badge("Ready", "green")], ["HbA1c", "HBA1C", "Chemistry", "Immunoassay · Finecare", "GHS 120", "4 h", badge("Reference review", "amber")], ["D-Dimer", "DDIM", "Haematology", "Method not selected", "GHS 180", "6 h", badge("Incomplete", "red")]],
  },
  references: {
    eyebrow: "Clinical configuration", title: "Reference intervals", subtitle: "Build method-, unit-, age- and sex-aware rules with source, approval and effective dates.", primary: "Create reference rule", secondary: "Check overlaps",
    metrics: [["Approved rules", "2,148", "Current facility", "green"], ["Draft rules", "12", "Awaiting clinical review", "amber"], ["Overlaps", "3", "Resolve before publish", "red"], ["Without source", "5", "Evidence required", "red"]],
    filters: ["All approval states", "All tests", "All methods"], columns: ["Test / analyte", "Partition", "Method", "Unit", "Interval", "Effective", "Approval"],
    rows: [["FBC · Haemoglobin", "Female · 18–60 years", "Sysmex XN-330", "g/dL", "Mock: 12.0–15.5", "01 Sep 2026", badge("Approved", "green")], ["FBC · Haemoglobin", "Male · 18–60 years", "Sysmex XN-330", "g/dL", "Mock: 13.0–17.5", "01 Sep 2026", badge("Approved", "green")], ["Creatinine", "Female · Adult", "Enzymatic", "µmol/L", "Mock: 45–84", "Draft", badge("Unverified", "amber")], ["HbA1c", "All adults", "Immunoassay", "%", "Mock demonstration", "Not effective", badge("Source required", "red")]],
  },
  "critical-values": {
    eyebrow: "Clinical safety configuration", title: "Critical values", subtitle: "Configure thresholds and escalation policies without hard-coding clinical rules into the application.", primary: "Create critical rule", secondary: "Escalation policy",
    metrics: [["Active rules", "126", "Clinically approved", "green"], ["Notification policies", "8", "By department/site", "blue"], ["Draft changes", "4", "Not in production", "amber"], ["Rules expiring", "2", "Review this month", "red"]],
    filters: ["All rule states", "All departments", "All severities"], columns: ["Test / analyte", "Lower threshold", "Upper threshold", "Severity", "Notify within", "Effective", "Status"],
    rows: [["Potassium", "Mock: < 2.5 mmol/L", "Mock: > 6.5 mmol/L", "Critical", "10 min", "01 Sep 2026", badge("Approved", "green")], ["Haemoglobin", "Mock: < 6.0 g/dL", "—", "Critical", "15 min", "01 Sep 2026", badge("Approved", "green")], ["Platelets", "Mock: < 20 ×10⁹/L", "Mock: > 1,000 ×10⁹/L", "Critical", "15 min", "Draft", badge("Unverified", "amber")], ["Glucose", "Rule review required", "Rule review required", "Critical", "10 min", "Expired", badge("Review now", "red")]],
  },
  templates: {
    eyebrow: "Configuration / reporting", title: "Report templates", subtitle: "Control facility branding, result layout, signatures, QR codes and versioned release formats.", primary: "Create template", secondary: "Upload logo",
    metrics: [["Templates", "6", "4 active", "blue"], ["Default", "Clinical report v3", "Published 29 Aug", "green"], ["Draft changes", "2", "Preview required", "amber"], ["Signature profiles", "14", "All valid", "green"]],
    filters: ["All template states", "All report types"], columns: ["Template", "Use", "Page", "Result layout", "Signature policy", "Version", "Status"],
    rows: [["Clinical Report", "Routine laboratory results", "A4", "Department sections", "Electronic verifier", "v3.2", badge("Default", "green")], ["Screening Certificate", "Programme screening", "A4", "Compact summary", "Programme approver", "v1.4", badge("Active", "green")], ["Microbiology Report", "Culture and susceptibility", "A4", "Isolate tables", "Microbiologist", "v2.1", badge("Active", "green")], ["Patient Portal Summary", "Digital delivery", "Responsive", "Patient friendly", "Electronic verifier", "Draft", badge("Preview", "amber")]],
  },
  integrations: {
    eyebrow: "Configuration / interoperability", title: "Integrations", subtitle: "Manage authenticated connections to HIS/EMR systems, gateways and result destinations.", primary: "Add integration", secondary: "API credentials",
    metrics: [["Connections", "12", "10 healthy", "blue"], ["Messages today", "4,802", "99.6% successful", "green"], ["Warnings", "2", "Retrying safely", "amber"], ["Credentials expiring", "1", "Within 14 days", "red"]],
    filters: ["All connection states", "All integration types", "All facilities"], columns: ["Integration", "Type", "Facility / site", "Direction", "Last event", "Health", "Status"],
    rows: [["Central Hospital HIS", "FHIR / REST", "LabNett Central", "Bidirectional", "11:31", "318 ms", badge("Healthy", "green")], ["GW-ACCRA-01", "Device Gateway", "Main Branch", "Bidirectional", "11:32", "14 queued", badge("Syncing", "amber")], ["Clinician Result Portal", "REST API", "All sites", "Outbound", "11:29", "186 ms", badge("Healthy", "green")], ["Legacy Billing", "HL7 v2", "Korle View", "Inbound", "10:58", "3 retries", badge("Warning", "amber")]],
  },
  settings: {
    eyebrow: "Configuration", title: "System settings", subtitle: "Control identifiers, workflow defaults, security, notifications, localization and downtime behavior.", primary: "Publish configuration", secondary: "View version history",
    metrics: [["Configuration", "v14", "Production version", "blue"], ["Pending changes", "7", "Across 4 sections", "amber"], ["Policy checks", "28 / 28", "All required controls pass", "green"], ["Last backup", "11:00", "Restore test passed", "green"]],
    filters: ["All setting groups", "Production configuration"], columns: ["Setting group", "Summary", "Changed by", "Last changed", "Publish requirement", "Status"],
    rows: [["Identifiers & numbering", "Patient, order, specimen, accession formats", "Kofi Asante", "02 Sep 2026", "Admin approval", badge("Published", "green")], ["Workflow policies", "Collection, acceptance, verification, release", "Dr Esi Badu", "07 Sep 2026", "Clinical approval", badge("Draft changes", "amber")], ["Security & sessions", "MFA, timeout, password and service scopes", "Daniel Tetteh", "29 Aug 2026", "Security approval", badge("Published", "green")], ["Offline & downtime", "Queue limits, sync, continuity notices", "Daniel Tetteh", "08 Sep 2026", "Validation required", badge("Testing", "amber")]],
  },
};

function Status({ value }: { value: { label: string; tone: Tone } }) {
  return <span className={`status ${value.tone}`}>{value.label}</span>;
}

function CellValue({ value }: { value: Cell }) {
  return typeof value === "string" ? <>{value}</> : <Status value={value} />;
}

function AnalyticsVisual() {
  return <div className="insight-grid section-gap">
    <div className="panel insight-panel"><div className="panel-head"><h2>Weekly volume and TAT</h2><span>Last 7 days</span></div><div className="analytics-bars">{[62, 76, 68, 91, 84, 55, 88].map((height, index) => <div className="analytics-column" key={index}><div className="analytics-bar" style={{ height: `${height}%` }} /><span>{["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"][index]}</span></div>)}</div></div>
    <div className="panel insight-panel"><div className="panel-head"><h2>Operational interpretation</h2><span>Current period</span></div><div className="insight-list"><p><b>Haematology is stable.</b><span>97% of tests are within the configured target TAT.</span></p><p><b>Microbiology needs review.</b><span>Rejection and ageing work are above facility targets.</span></p><p><b>Sunday capacity is lower.</b><span>Volume reduced 34% while P95 TAT increased.</span></p></div></div>
  </div>;
}

function ConfigurationDetail({ view }: { view: View }) {
  const details: Partial<Record<View, [string, string][]>> = {
    users: [["Receptionist", "patient.search · patient.register · order.create · payment.update"], ["Bench scientist", "worklist.read · result.enter · result.review · repeat.request"], ["Authorized verifier", "result.verify · critical.notify · report.release"], ["Interface engineer", "analyzer.manage · mapping.manage · interface.inspect"]],
    interfaces: [["Raw message retention", "Encrypted · 90 days"], ["Deduplication", "Analyzer + message control ID"], ["Unsafe matching", "Held for manual investigation"], ["Last gateway sync", "11:32:18 · 14 messages queued"]],
    quality: [["QC rule engine", "Configured per analyzer, test, control and lot"], ["Patient result protection", "Blocked while applicable QC hold is active"], ["Open corrective action", "CA-2026-0041 · XN CHECK Level 2"], ["Review owner", "Dr Esi Badu · Quality Manager"]],
    settings: [["Clinical action policy", "Statuses change only through explicit workflow actions"], ["Report versioning", "Released artifacts are immutable"], ["Facility isolation", "Required on every patient and clinical query"], ["Audit retention", "Configured by legal and accreditation policy"]],
    references: [["Rule precedence", "Facility + test + method + unit + age + sex"], ["Overlap behavior", "Publishing blocked until overlap is resolved"], ["Unknown partition", "Result held for review; no silent fallback"], ["Mock data notice", "Displayed intervals are demonstrations only"]],
    "critical-values": [["Closure requirement", "Named recipient, role, time, method and read-back"], ["Escalation", "Timed policy by severity and requester context"], ["Release relationship", "Facility policy controls whether notification must close first"], ["Mock data notice", "Displayed thresholds are demonstrations only"]],
  };
  const rows = details[view];
  if (!rows) return null;
  return <div className="panel section-gap"><div className="panel-head"><h2>{view === "users" ? "Permission model" : "Safety and governance"}</h2><span>Current configuration</span></div><div className="detail-grid">{rows.map(([label, value]) => <div className="detail-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>;
}

function ConfigurationForm({ view, title, onClose, onSave }: { view: View; title: string; onClose: () => void; onSave: (summary: string) => void }) {
  const fields = formSchemas[view] ?? commonFields;
  const initial = Object.fromEntries(fields.map(field => [field.name, field.type === "color" ? "#236b89" : field.options?.[0] ?? ""]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const missing = fields.some(field => field.required && !values[field.name]?.trim());
  const update = (name: string, value: string) => setValues(current => ({ ...current, [name]: value }));

  return <div className="modal-backdrop" role="presentation"><form className="configuration-modal" role="dialog" aria-modal="true" aria-label={title} onSubmit={event => { event.preventDefault(); if (!missing) onSave(values.name || values.test || values.item || values.firstName || title); }}><div className="panel-head"><div><h2>{title}</h2><span>Required fields are marked. Saving creates an auditable draft.</span></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close">×</button></div><div className="form-grid">{fields.map(field => <label className={field.type === "textarea" ? "wide" : ""} key={field.name}>{field.label}{field.required ? " *" : ""}{field.type === "select" ? <select value={values[field.name]} onChange={event => update(field.name, event.target.value)}>{field.options?.map(option => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea value={values[field.name]} onChange={event => update(field.name, event.target.value)} placeholder={field.placeholder} /> : <input type={field.type ?? "text"} value={values[field.name]} onChange={event => update(field.name, event.target.value)} placeholder={field.placeholder} />}</label>)}</div>{view === "users" && <div className="assignment-preview"><strong>Account visibility preview</strong><span>Only templates activated in Roles & Dashboards appear here. The account receives only the selected facility, branch, unit and role scope; senior verification remains a separate authorization.</span></div>}<div className="modal-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button type="submit" className="button primary" disabled={missing}>Save draft</button></div></form></div>;
}

function RecordDetail({ spec, row, onClose }: { spec: ScreenSpec; row: Cell[]; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="configuration-modal compact" role="dialog" aria-modal="true" aria-label={`${spec.title} record`}><div className="panel-head"><div><h2>{spec.title} record</h2><span>Current configuration and operational state</span></div><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div><div className="detail-grid modal-detail">{spec.columns.map((column, index) => <div className="detail-card" key={column}><span>{column}</span><strong>{typeof row[index] === "string" ? row[index] : row[index]?.label}</strong></div>)}</div><div className="assignment-preview"><strong>Traceability</strong><span>Changes to this record require a reason and are recorded with actor, time, facility scope and before/after values.</span></div><div className="modal-actions"><button className="button primary" onClick={onClose}>Done</button></div></div></div>;
}

export function AdminScreen({ view, notify }: { view: View; notify: (message: string) => void }) {
  const spec = screens[view] ?? screens.settings!;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Overview");
  const [formOpen, setFormOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<Cell[] | null>(null);
  const filtered = useMemo(() => spec.rows.filter(row => row.some(cell => (typeof cell === "string" ? cell : cell.label).toLowerCase().includes(query.toLowerCase()))), [query, spec.rows]);

  return <div className="content">
    <div className="page-head"><div><div className="eyebrow">{spec.eyebrow}</div><h1>{spec.title}</h1><p className="subtitle">{spec.subtitle}</p></div><div className="button-row">{spec.secondary && <button className="button" onClick={() => setTab("Configuration")}>{spec.secondary}</button>}<button className="button primary" onClick={() => setFormOpen(true)}>+ {spec.primary}</button></div></div>
    <div className="metric-grid">{spec.metrics.map(([label, value, note, tone]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><span className={`metric-pulse ${tone}`} /></div><div className="metric-value">{value}</div><div className={`metric-foot ${tone === "green" ? "good" : tone === "red" || tone === "amber" ? "warn" : ""}`}>{note}</div></div>)}</div>
    <div className="panel">
      <div className="subnav">{["Overview", "Configuration", "History"].map(item => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
      <div className="toolbar"><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${spec.title.toLowerCase()}`} />{spec.filters.map(filter => <select key={filter} aria-label={filter}><option>{filter}</option></select>)}<button className="button small" onClick={() => setQuery("")}>Reset</button></div>
      <div className="table-wrap"><table><thead><tr>{spec.columns.map(column => <th key={column}>{column}</th>)}<th /></tr></thead><tbody>{filtered.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><CellValue value={cell} /></td>)}<td><button className="button small" onClick={() => setDetailRow(row)}>Open</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-table"><strong>No matching records</strong><span>Change the search or reset the filters.</span></div>}</div>
    </div>
    {view === "analytics" && <AnalyticsVisual />}
    <ConfigurationDetail view={view} />
    {formOpen && <ConfigurationForm view={view} title={spec.primary} onClose={() => setFormOpen(false)} onSave={summary => { setFormOpen(false); notify(`${summary} saved as an auditable draft`); }} />}
    {detailRow && <RecordDetail spec={spec} row={detailRow} onClose={() => setDetailRow(null)} />}
  </div>;
}
