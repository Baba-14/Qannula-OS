# LabNett Product Gap Assessment

**Updated:** 2026-09-08  
**Purpose:** Track capabilities required to move the current functional frontend into a validated production LIS.

## Product boundary already established

- LabNett Software Owner: platform governance, facilities, subscriptions, global templates, security, integrations, system health and privacy-safe network oversight.
- Facility Administrator: facility configuration, branding, branches, units, users, role/station assignments and local catalogue.
- Laboratory Manager: cross-unit operations, staffing, routing, workload, TAT and handover.
- Station roles: reception/accounts, phlebotomy, pre-lab, analytical departments, post-lab verification, quality, interfaces and resources.
- LabNett Software Owner has no routine clinical authority. Temporary support access is facility-approved, ticket-linked, scoped, monitored, audited and limited to 60 minutes.

## Additional configurable roles implemented in the frontend

These should be configurable; a small facility may combine them while retaining separate permissions.

1. Cashier / Claims Officer — payments, refunds, insurance authorization and reconciliation without clinical-result access.
2. Specimen Courier — dispatch, pickup, temperature, seal and chain-of-custody events.
3. Store / Procurement Officer — receipts, issues, purchase requests, suppliers, lots and stock counts.
4. Biomedical / Equipment Officer — maintenance, calibration, downtime and service evidence.
5. Referral Coordinator — external-lab dispatch, tracking, returned results and referral invoices.
6. Ordering Clinician / Client Portal User — order requests and reports limited to their patients/organization.
7. Patient Portal User — identity-verified access to released reports only.
8. Branch Administrator — branch-scoped administration without facility-wide authority.
9. Auditor / Accreditation Assessor — time-limited read-only evidence access.
10. Privacy / Security Officer — access reviews, privacy incidents, retention and security policy.

Each role now has a scoped navigation definition, dashboard preview, account-assignment option and direct `/workspace/{role}` preview route. Backend authorization and specialized persistent workflows remain required before production deployment.

## Critical capabilities not yet production-complete

### Clinical workflow and safety

- Complete patient registration, duplicate resolution and merge governance.
- Configurable order forms, requester/ward/client management and electronic authorization.
- Barcode generation/printing, tube rules, aliquots and full specimen chain of custody.
- Rejection, recollection, cancellation, referral and add-on test workflows.
- Department-specific dynamic result forms and analyzer result review.
- Delta checks, autoverification rules, panic/critical communication and read-back escalation.
- Corrected/amended report workflow with preserved original versions and reverification.
- Method validation, reference-rule approval and effective-date versioning.

### Quality management

- Document/SOP control, staff training, competency and authorization records.
- Internal QC charts, Westgard-style configurable rules and lot-to-lot validation.
- EQA/proficiency testing and external assessment evidence.
- Nonconformity, incident, risk, CAPA and effectiveness-review workflows.
- Environmental monitoring, temperature logs and reagent/equipment traceability.

### Business and client operations

- Price lists, contracts, discounts, refunds, invoices and insurer claim lifecycle.
- Client/clinician portal, patient portal and delivery consent/preferences.
- Appointments, home collection, outreach and corporate screening programmes.
- Referral-laboratory directory, service catalogue and cost/TAT agreements.

### Production engineering

- FastAPI/PostgreSQL backend with enforced tenant, facility, branch, unit and action authorization.
- Authentication, MFA, password/session policy, account recovery and periodic access review.
- Immutable audit storage, encryption, secrets management and privacy-safe observability.
- Offline queue, conflict handling, local gateway synchronization and disaster recovery.
- Real barcode/label printing, PDF report generation, email/SMS delivery and electronic signatures.
- Analyzer drivers, ASTM/HL7 processing, deduplication, mappings and reconciliation.
- Backups, restore drills, uptime monitoring, alerting, rate limiting and security testing.
- Data migration/import tools, retention policies and facility offboarding/export.
- Clinical validation, user-acceptance testing, performance testing and documented release approval.

## Optional specialist modules

These should be separate configurable modules because they carry distinct workflows and risk.

- Blood bank/transfusion management.
- Histopathology and cytology.
- Molecular diagnostics and batch workflows.
- Point-of-care testing governance.
- Public-health surveillance and statutory reporting.
- Biobanking/research specimen management.

## Recommended delivery priority

1. Build the backend authorization and audit foundation.
2. Complete the FBC vertical slice end to end with real persistent data.
3. Add barcode printing, specimen exceptions, analyzer mock and immutable reports.
4. Add facility setup, account assignment and approval/versioning persistence.
5. Validate clinical safety scenarios before broadening into additional departments.
6. Add quality, inventory, equipment, claims and portals in controlled releases.

The UI role-preview selector is a demonstration tool only. It must never become a permission mechanism in production.
