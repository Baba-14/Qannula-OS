"use client";

import { useMemo, useState } from "react";
import type { RoleId, View } from "../lib/navigation";

type UnitRole = "pre_lab_scientist" | "haematology_scientist" | "chemistry_scientist" | "microbiology_scientist";
type WorkItem = {
  accession: string;
  patient: string;
  test: string;
  specimen: string;
  priority: "STAT" | "Routine";
  state: string;
  ready: boolean;
  due: string;
};

const work: Record<UnitRole, WorkItem[]> = {
  pre_lab_scientist: [
    { accession: "PENDING", patient: "Ama Mensah · PAT-00291", test: "Full Blood Count", specimen: "EDTA whole blood", priority: "STAT", state: "Collected · label matched", ready: true, due: "8 min" },
    { accession: "PENDING", patient: "Kwame Boateng · PAT-00882", test: "Renal Function", specimen: "Serum", priority: "Routine", state: "Awaiting collection", ready: false, due: "21 min" },
    { accession: "CH-260908-00424", patient: "Akosua Darko · PAT-00418", test: "HbA1c", specimen: "EDTA whole blood", priority: "Routine", state: "Centrifugation not required", ready: true, due: "Ready" },
    { accession: "PENDING", patient: "Nii Lamptey · PAT-00712", test: "Electrolytes", specimen: "Serum", priority: "STAT", state: "Payment hold", ready: false, due: "12 min" },
  ],
  haematology_scientist: [
    { accession: "HM-260908-01572", patient: "Ama Serwaa · PAT-01844", test: "Full Blood Count", specimen: "EDTA whole blood", priority: "STAT", state: "Ready for testing", ready: true, due: "12 min" },
    { accession: "HM-260908-01569", patient: "Kofi Antwi · PAT-00531", test: "Blood Film", specimen: "EDTA whole blood", priority: "Routine", state: "Slide preparation", ready: true, due: "46 min" },
    { accession: "HM-260908-01561", patient: "Efua Ofori · PAT-00411", test: "Full Blood Count", specimen: "EDTA whole blood", priority: "STAT", state: "QC hold", ready: false, due: "Blocked" },
  ],
  chemistry_scientist: [
    { accession: "CH-260908-00431", patient: "Kweku Mensah · PAT-01442", test: "Electrolytes", specimen: "Serum", priority: "STAT", state: "Ready on BS-240", ready: true, due: "8 min" },
    { accession: "CH-260908-00428", patient: "Yaw Owusu · PAT-01092", test: "Renal Function", specimen: "Serum", priority: "Routine", state: "Analyzer queue", ready: true, due: "1 h 22 min" },
    { accession: "CH-260908-00420", patient: "Adwoa Kusi · PAT-01142", test: "Liver Function", specimen: "Serum", priority: "Routine", state: "Haemolysed · review", ready: false, due: "Blocked" },
  ],
  microbiology_scientist: [
    { accession: "MB-260908-00322", patient: "Naa Dedei · PAT-01662", test: "Urine Culture", specimen: "Midstream urine", priority: "Routine", state: "Incubation · day 2", ready: true, due: "Day 2 of 3" },
    { accession: "MB-260908-00318", patient: "Adwoa Kusi · PAT-01142", test: "Urine Culture", specimen: "Midstream urine", priority: "Routine", state: "Identification", ready: true, due: "18 h" },
    { accession: "MB-260908-00311", patient: "Kojo Nyarko · PAT-00908", test: "Blood Culture", specimen: "Blood culture bottle", priority: "STAT", state: "Bottle integrity query", ready: false, due: "Review" },
  ],
};

const unitInfo: Record<UnitRole, { eyebrow: string; title: string; subtitle: string; analyzer: string; qc: string }> = {
  pre_lab_scientist: { eyebrow: "Pre-lab / assigned station", title: "Pre-analytical workspace", subtitle: "Only orders entering collection, reception, accession and processing are visible here.", analyzer: "Barcode & accession station", qc: "Identity controls active" },
  haematology_scientist: { eyebrow: "Laboratory unit / Haematology", title: "Haematology bench", subtitle: "Only haematology tests routed to your assigned bench are visible.", analyzer: "Sysmex XN-330", qc: "QC hold · Level 2" },
  chemistry_scientist: { eyebrow: "Laboratory unit / Clinical Chemistry", title: "Chemistry bench", subtitle: "Only chemistry specimens and tests assigned to this unit are visible.", analyzer: "Mindray BS-240", qc: "QC passed · 07:54" },
  microbiology_scientist: { eyebrow: "Laboratory unit / Microbiology", title: "Microbiology bench", subtitle: "Culture, identification and susceptibility work remains staged and traceable.", analyzer: "Culture workbench", qc: "Media QC passed" },
};

export function isUnitRole(role: RoleId): role is UnitRole {
  return role === "pre_lab_scientist" || role === "haematology_scientist" || role === "chemistry_scientist" || role === "microbiology_scientist";
}

export function UnitDashboard({ role, setView }: { role: UnitRole; setView: (view: View) => void }) {
  const info = unitInfo[role];
  const [filter, setFilter] = useState<"All" | "Ready" | "Not ready">("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => work[role].filter(item => {
    const matchesFilter = filter === "All" || (filter === "Ready" ? item.ready : !item.ready);
    return matchesFilter && Object.values(item).join(" ").toLowerCase().includes(query.toLowerCase());
  }), [filter, query, role]);
  const ready = work[role].filter(item => item.ready).length;
  const nextView: View = role === "pre_lab_scientist" ? "reception" : role === "microbiology_scientist" ? "microbiology" : "results";

  return <div className="content unit-dashboard">
    <div className="page-head"><div><div className="eyebrow">{info.eyebrow}</div><h1>{info.title}</h1><p className="subtitle">{info.subtitle}</p></div><div className="button-row"><span className="station-badge">Assigned station</span><button className="button primary" onClick={() => setView(nextView)}>Open next task</button></div></div>
    <div className="station-context"><div><span>Facility</span><strong>Korle View Diagnostics</strong></div><div><span>Branch</span><strong>Accra Main Branch</strong></div><div><span>Station / device</span><strong>{info.analyzer}</strong></div><div><span>Quality state</span><strong>{info.qc}</strong></div></div>
    <div className="metric-grid section-gap"><div className="metric"><div className="metric-top">Assigned today</div><div className="metric-value">{work[role].length}</div><div className="metric-foot">Restricted to this unit</div></div><div className="metric"><div className="metric-top">Ready now</div><div className="metric-value">{ready}</div><div className="metric-foot good">Identity and routing complete</div></div><div className="metric"><div className="metric-top">Not ready / held</div><div className="metric-value">{work[role].length - ready}</div><div className="metric-foot warn">Requires explicit resolution</div></div><div className="metric"><div className="metric-top">Within TAT</div><div className="metric-value">96%</div><div className="metric-foot good">Current shift</div></div></div>
    <section className="panel"><div className="panel-head"><div><h2>{role === "pre_lab_scientist" ? "Specimen readiness queue" : "Assigned test worklist"}</h2><span>Facility routing and account assignment applied</span></div><span className="status blue">Live queue</span></div><div className="toolbar"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search accession, patient or test" /><select value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option>All</option><option>Ready</option><option>Not ready</option></select><span className="scope-lock">🔒 {role === "pre_lab_scientist" ? "Pre-lab only" : `${info.title} only`}</span></div><div className="table-wrap"><table><thead><tr><th>Accession</th><th>Patient</th><th>Test</th><th>Specimen</th><th>Priority</th><th>Readiness / stage</th><th>TAT</th><th /></tr></thead><tbody>{rows.map(item => <tr key={`${item.accession}-${item.test}`}><td><strong>{item.accession}</strong></td><td>{item.patient}</td><td><strong>{item.test}</strong></td><td>{item.specimen}</td><td><span className={`status ${item.priority === "STAT" ? "red" : "gray"}`}>{item.priority}</span></td><td><span className={`status ${item.ready ? "green" : "amber"}`}>{item.state}</span></td><td>{item.due}</td><td><button className={`button small ${item.ready ? "primary" : ""}`} onClick={() => setView(item.ready ? nextView : role === "pre_lab_scientist" ? "collection" : "quality")}>{item.ready ? "Open" : "Resolve"}</button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-table"><strong>No tests in this view</strong><span>Change the readiness filter or search term.</span></div>}</div></section>
    <div className="permission-note section-gap"><strong>Why am I seeing this?</strong><span>Your facility administrator assigned this account to {info.title}. Tests from other departments are hidden; backend authorization must enforce the same scope.</span></div>
  </div>;
}
