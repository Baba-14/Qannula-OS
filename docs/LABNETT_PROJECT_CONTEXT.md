# LabNett Project Context

**Status:** Working product, UI/UX and engineering source of truth  
**Updated:** 2026-09-08

## Product definition

LabNett is a production-grade, configurable Laboratory Information System (LIS) for standalone laboratories, hospital laboratories, diagnostic centres, multi-branch networks, screening programmes, referral laboratories and resource-constrained healthcare environments.

It is not a generic administration dashboard. It must make laboratory work safer, faster, traceable and easier to manage.

## Core laboratory workflow

```text
Patient → Order → Specimen → Collection → Reception → Accession
→ Department Worklist → Analyzer/Manual Testing → Technical Review
→ Verification → Critical Result Management → Report → Release
```

Every result must remain traceable to the correct patient, order, specimen, accession, test, analyzer/method, QC state, reviewer, verifier and report version.

## Product responsibilities

LabNett owns or supports:

- Patient registration and duplicate prevention
- Laboratory orders, priorities, clinical notes and authorization/payment status
- Specimen requirements, collection, labels, barcodes, reception and rejection/recollection
- Accessioning, routing, aliquots and departmental worklists
- Manual and analyzer-generated results
- Dynamic result forms for numeric, qualitative, ordinal, text, microscopy and microbiology results
- Reference intervals, critical values, units, precision, methods and facility-specific rules
- Technical review, repeat/hold workflows, verification and critical-result communication
- Branded, versioned, corrected and amended reports
- Master catalogue, facility catalogue and method/analyzer configuration
- Analyzer registry, mapping, interface monitoring and unmatched-result reconciliation
- QC, equipment, maintenance, referrals and inventory
- Users, roles, permissions, facility/site scopes and audit trails
- TAT, workload, rejection, analyzer, QC and critical-result analytics
- Offline operation, local queuing and cloud synchronization
- Interoperability with hospital systems and external destinations

## Analyzer integration model

```text
Analyzer / vendor workstation
        ↓
Local LabNett Device Gateway
        ↓
Parse and normalize message
        ↓
Map analyzer code to LabNett test
        ↓
Match exact accession/specimen
        ↓
Apply QC, flags, reference and critical rules
        ↓
Technical review → Verification → Release
```

The analyzer may have its own vendor software. LabNett is the system that connects the laboratory workflow to the analyzer result, validates and governs the result, and produces the final clinical report. Analyzer connectivity may use serial, TCP/IP, ASTM, HL7, vendor protocols, file import or manual entry. Internet availability must not be assumed for local analyzer operation; the gateway should support local queues and synchronization.

Unknown sample IDs, duplicate messages, unmapped codes and unsafe matches must be held for investigation and must never be silently attached to a patient.

## Catalogue architecture

```text
LabNett Master Catalogue
        ↓ activate and personalize
Facility Catalogue
        ↓ configure local method/device
Method / Analyzer Configuration
```

Tests must be configurable rather than hard-coded. Facility configuration includes local name/code, department, price, TAT, specimen, method, analyzer, reporting unit, decimal precision, reference intervals, critical limits, report order and release policy. Clinical rules are facility-governed and versioned; do not treat mock ranges or thresholds as universal clinical truth.

## Initial vertical slice

The first implementation should validate the data model and clinical workflow before broad expansion:

```text
Configure FBC
→ Create patient and order
→ Generate EDTA specimen requirement
→ Collect and print barcode
→ Receive and accept specimen
→ Create accession
→ Haematology worklist
→ Enter FBC manually
→ Technical review and verification
→ Generate branded report
→ Release report
→ Replace manual entry with a mock analyzer
→ Connect the first real analyzer
```

The initial acceptance path should cover normal, abnormal, critical, repeat, rejected-specimen, duplicate-message, unknown-sample and corrected-report scenarios.

## UI/UX direction

Primary target: desktop laboratory workstation. Secondary targets: tablet for collection/equipment workflows and limited mobile alert/management use.

The interface should feel clinical, calm, professional, trustworthy, fast and information-dense without clutter. Prefer tables, worklists, filters, timelines, status indicators, side panels, structured forms, barcode workflows and keyboard-friendly interactions. Avoid generic SaaS dashboards, excessive gradients, glassmorphism, decorative animation and oversized cards.

The application shell should include permission-aware navigation for:

- Workspace: Dashboard, Orders, Collection, Specimen Reception, Worklists, Results, Verification, Critical Results
- Laboratory: Test Catalogue, Analyzers, Interface Monitor, QC, Equipment, Referrals, Inventory
- Management: Reports, Analytics, Patients, Users/Roles, Audit Trail
- Configuration: Facility, Departments, Test Configuration, Reference Intervals, Critical Values, Report Templates, Integrations, Settings

Always display patient identity prominently during collection, reception, result entry, review, verification and critical-result workflows. Dangerous actions require confirmation, and workflow status must change through explicit clinical actions rather than arbitrary dropdown editing.

Every important screen needs populated, loading, empty, error, permission and offline states where applicable. Offline messaging must clearly show queued work and last successful synchronization.

## Required reusable frontend components

AppShell, Sidebar, GlobalSearch, FacilitySwitcher, PatientBanner, StatusBadge, PriorityBadge, CriticalBadge, AnalyzerStatus, WorklistTable, FilterBar, ResultTable, SpecimenTimeline, OrderTimeline, AuditTimeline, BarcodeField, ScannerInput, ResultInput, ReferenceRangeDisplay, AnalyzerFlag, QCStatus, ConfirmationDialog, ClinicalWarning, EmptyState, OfflineBanner, NotificationDrawer, DetailDrawer, ReportViewer and PermissionGate.

## Screen implementation order

1. Design system, application shell, login, dashboard and user/role framework
2. Patient search/profile, registration, orders and order details
3. Collection, specimen reception, accession and department worklists
4. Manual results, analyzer review, verification, critical results and reports
5. Master catalogue, test definition, facility configuration, reference intervals and critical values
6. Analyzer registry, setup wizard, mappings, interface monitor and reconciliation
7. QC, equipment and maintenance
8. Microbiology, referrals and inventory
9. Users, permissions, audit, report templates and integrations
10. TAT, workload, analyzer, rejection, QC and critical-result analytics

Do not create disconnected screens. Build real flows, beginning with the FBC vertical slice, and reuse the same components and interaction patterns throughout the product.

## Core workflows to support

- FBC: patient → order → EDTA collection → barcode → reception → accession → worklist → result → review → verification → report
- Specimen rejection: reception → rejection reason → recollection request → new specimen
- Analyzer failure: analyzer → interface error → monitor → investigation → resolution → result
- Unknown sample: analyzer result → reconciliation queue → authorized investigation → resolve or reject
- Critical result: result → rule → review → verification → contact/read-back → close → release
- Corrected report: released report → amendment reason → new result/report version → reverification → corrected release, preserving original

## Engineering direction

Frontend: Next.js, React and TypeScript with reusable domain-based components and a mock API/data layer initially. Prepare for a FastAPI backend.

Backend direction: FastAPI/Python, PostgreSQL, Alembic, clear domain modules, relational constraints and transactions, JSONB only for genuinely variable metadata/raw payloads, asynchronous jobs for PDFs/notifications/imports/synchronization, and structured audit/observability.

Suggested frontend domains:

```text
app/
  dashboard/ patients/ orders/ collection/ specimens/ worklists/
  results/ verification/ critical/ reports/ catalogue/ analyzers/
  interfaces/ quality/ equipment/ referrals/ analytics/
  administration/ settings/

components/
  clinical/ tables/ forms/ navigation/ results/ specimens/
  analyzers/ quality/
```

## Safety and governance principles

- Every analyzer or manually entered patient result must enter the results worklist for evaluation and final verification by an authorized senior laboratory scientist before report release.
- Never silently attach an ambiguous analyzer result to a patient.
- Never overwrite released results or reports; preserve history and versions.
- Keep analyzer flags separate from clinical reference/critical flags.
- Require appropriate permissions for verification, reconciliation, report amendment, reference changes and analyzer mapping changes.
- Audit clinical actions, configuration changes and before/after values.
- Use realistic fictional data, including Ghanaian names and plausible identifiers, without presenting mock clinical rules as universal.
- Keep financial status visually separate from clinical workflow status.
- Preserve patient privacy in management analytics.

## Clarified administration requirements

- The Reports workspace is a cross-facility report register, with facility/site filters and immutable Original, Corrected, Amended and Preliminary versions.
- The Facility workspace must support creating a laboratory and configuring its identity, contacts, sites and report branding, including logo, brand colour, report header and footer.
- An onboarded laboratory has a dedicated facility-facing dashboard with its own branding, branch context, operational queues, laboratory flow, analyzer health, staffing, TAT and configuration-readiness status.
- The Facility Administrator configures the facility operating model: Reception/Registration, Payment & Claims, pre-analytical collection/reception/accession, enabled analytical departments, post-analytical evaluation/verification/reporting, and governance units for accountability, TAT, QC, inventory, equipment and referrals.
- Facility setup cannot be published unless required operational units are enabled and each active analytical department has a qualified lead, positive default TAT and mandatory senior-scientist verification.

## Realistic mock data example

```text
Patient: Ama Mensah
Patient ID: PAT-00291
Order: ORD-2026-00821
Accession: HM-260908-01552
Analyzer: Sysmex XN-330

FBC:
WBC 6.42 ×10⁹/L | RBC 4.91 ×10¹²/L | HGB 14.2 g/dL
HCT 43.1% | MCV 87.8 fL | MCH 28.9 pg
MCHC 32.9 g/dL | PLT 241 ×10⁹/L
```

## Working rule for future implementation

When making product or implementation decisions, prioritize the laboratory workflow, patient/specimen safety, traceability, configurability and the FBC vertical slice. The UI must answer clearly: **Which patient? Which specimen? Which test? Which analyzer/method? Which result? Which flags? Which QC state? Who verified it?**

## Role and station workspace decisions

- Navigation is grouped into collapsible operational categories: Overview, Patient Services, Pre-Lab, Laboratory Units, Post-Lab, Quality & Resources, Management and Configuration.
- A facility administrator assigns each staff account to a facility, branch, role, unit/station, shift and clinical authorization level. That assignment determines its landing dashboard, visible queues and permitted actions.
- Pre-lab users see specimen readiness, collection, reception, accession and processing work only. They do not see result entry or verification.
- Analytical staff receive department-scoped workspaces. Haematology, Clinical Chemistry and Microbiology users see only tests routed to their assigned unit; ready and held work remain visibly separate.
- Senior laboratory scientists own post-lab evaluation, verification, critical communication and release. Quality staff have a separate quality and compliance workspace.
- Facility administrators and laboratory managers retain cross-unit operational oversight. The main administrator has network-wide visibility, including quality, configuration, facilities and audit activity.
- Direct preview routes are available at `/workspace/pre-lab`, `/workspace/haematology`, `/workspace/chemistry`, `/workspace/microbiology`, `/workspace/post-lab` and `/workspace/quality`.
- Configuration actions should open real forms and preserve an auditable draft/publish model. UI role filtering is a preview; backend authorization must enforce the same facility, site, unit and action scopes.
- Additional configurable roles are Cashier/Claims Officer, Specimen Courier, Store/Procurement Officer, Biomedical/Equipment Officer, Referral Coordinator, Ordering Clinician, Patient Portal User, Branch Administrator, Read-Only Auditor and Privacy/Security Officer. Each has a restricted dashboard and direct workspace preview.
- Role governance has two levels. The **LabNett Software Owner** creates and versions global role/dashboard templates, including permission bundles, subscription tiers and protected clinical boundaries. A **Facility Administrator** can activate approved templates for their own facility and assign actual staff accounts, but cannot weaken platform safety controls.
- The global role library is available at `/platform/roles`; the facility activation catalogue is at `/facility/roles`. Only activated role templates should appear in the facility Users & Assignments form.
- Facility onboarding follows Identity → Modules → Account types → Administrator → Review. It provisions a facility-isolated workspace and initial administrator invitation; it does not create patients or grant the Software Owner clinical access.

## Platform-owner access boundary

- The role formerly labelled Main Administrator is displayed as **LabNett Software Owner** to distinguish it from facility administration. It governs the platform but cannot normally create patients, handle specimens, enter results, verify results or release reports.
- Patient-identifiable and clinical records remain controlled by the onboarded facility. Main-administrator dashboards use privacy-safe operational aggregates by default.
- Support access is disabled by default and must be linked to a valid support ticket, limited to one facility and declared scope, approved by a named facility administrator, fully monitored and automatically expired within 60 minutes.
- Controlled support access never grants clinical verification or report-release authority. Those actions require a separately assigned qualified clinical role.
- Emergency and support sessions must record requester, approver, facility, reason, scope, start/end time, searches, records viewed and changes made.
- The software-owner console is available at `/platform`. It exposes customer counts, subscriptions, service health and a searchable facility directory, but no automatic facility-dashboard action.
- Its normal navigation is intentionally limited to platform dashboard, customer facilities, privacy-safe analytics, master catalogue, platform integrations and platform settings. Facility staff accounts and clinical audit records remain facility-admin responsibilities. Support requests begin from each facility detail page; the central register remains accessible from the dashboard request queue rather than occupying a duplicate sidebar category.
- A facility dashboard becomes available to platform support only while a facility-approved request is active. The facility administrator can explicitly grant or deny the requested scope and duration; expiration revokes access automatically.
- The dedicated support register can be previewed directly at `/platform/support`.
- Network performance is available on the Software Owner overview and at `/platform/facilities`. It uses privacy-safe facility aggregates for configured staff, departments, test volume, median/P95 TAT, percentage within target, QC state and platform uptime, with CSV export for all or filtered facilities.
- Each onboarded facility has an aggregate Software Owner detail route at `/platform/facilities/{code}`. It shows branch count and activity, configured/required staffing, operating units, test volume, TAT, QC and uptime. Support access can be requested from that same page; the clinical facility dashboard remains locked until approval.
