# Qannula

LabNett is a configurable laboratory information system for laboratory networks, hospital laboratories, standalone diagnostic centres and screening programmes.

## Current implementation

This frontend prototype includes a dedicated **LabNett Software Owner** console and separate facility/clinical workspaces.

- Software-owner scope: customer facilities, subscriptions, service health, global templates, integrations, security and privacy-safe analytics
- Facility-level support requests with a central tracking register for timed, approved service access
- Facility-administrator scope: local catalogue, tests, reference intervals, critical values, devices, staff assignments, branding and reports
- Clinical workspaces: reception, pre-lab, department benches, verification, quality and laboratory management

The UI currently uses realistic mock data and connected client-side interactions. It is structured for later integration with the planned FastAPI and PostgreSQL backend.

Implemented navigation areas:

- Laboratory Network
- Dashboard
- Orders
- Collection
- Specimen Reception
- Worklists
- Results
- Verification
- Critical Results
- Test Catalogue
- Analyzers
- Interface Monitor
- Quality Control
- Equipment
- Referrals
- Inventory
- Reports
- Analytics
- Patients
- Users & Roles
- Audit Trail
- Facility
- Departments
- Test Configuration
- Reference Intervals
- Critical Values
- Report Templates
- Integrations
- Settings

## Run locally

```bash
npm install
npm run dev
```

Open the software-owner platform console at `http://localhost:3000/platform` (also the default workspace at `http://localhost:3000`).

Open the detailed facility-performance register at `http://localhost:3000/platform/facilities`.

Open the facility-facing workspace directly at `http://localhost:3000/facility`.

Configure the facility laboratory units at `http://localhost:3000/facility/setup`.

Use the role selector in the top bar to preview the permission-aware workspace for:

- LabNett Software Owner
- Facility Administrator
- Laboratory Manager
- Receptionist
- Phlebotomist
- Pre-Lab Scientist
- Haematology Scientist
- Chemistry Scientist
- Microbiology Scientist
- Multi-Discipline Scientist
- Senior Laboratory Scientist
- Quality Manager
- Interface Engineer
- Cashier / Claims Officer
- Specimen Courier
- Store / Procurement Officer
- Biomedical / Equipment Officer
- Referral Coordinator
- Ordering Clinician
- Patient Portal User
- Branch Administrator
- Read-Only Auditor
- Privacy / Security Officer

In addition to the FBC flow, the prototype includes interactive payment/authorization, staff and bench allocation, microbiology stage tracking, and guarded analyzer-result reconciliation.

## Validate

```bash
npm run build
npm test
```

The durable product and clinical context is in [`docs/LABNETT_PROJECT_CONTEXT.md`](docs/LABNETT_PROJECT_CONTEXT.md).

Role governance previews are available at `/platform/roles` for the Software Owner and `/facility/roles` for the Facility Administrator. New-facility provisioning, including module and role selection, starts from `/platform/facilities`.
# Lab-Os
