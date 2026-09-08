"use client";

import { useMemo, useState } from "react";
import { facilityPerformance, networkSummary, performanceCsv } from "../lib/platform-analytics";
import type { FacilityPerformance } from "../lib/platform-analytics";
import { FacilityOnboarding } from "./facility-onboarding";

function downloadCsv(rows: FacilityPerformance[]) {
  const blob = new Blob([performanceCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `labnett-facility-performance-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  URL.revokeObjectURL(url);
}

export function PlatformFacilitiesScreen() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [rows, setRows] = useState(facilityPerformance);
  const [onboarding, setOnboarding] = useState(false);
  const filtered = useMemo(() => rows.filter(row => (region === "All regions" || row.region === region) && Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())), [query, region, rows]);
  const summary = networkSummary(rows);

  return <div className="content"><div className="page-head"><div><div className="eyebrow">Software owner / customer network</div><h1>Facility performance</h1><p className="subtitle">Compare adoption, staffing, throughput, TAT, quality and service health across facilities without patient-identifiable data.</p></div><div className="button-row"><button className="button" onClick={() => downloadCsv(filtered)}>Export performance CSV</button><button className="button primary" onClick={() => setOnboarding(true)}>+ Onboard facility</button></div></div>
    <div className="metric-grid"><div className="metric"><div className="metric-top">Onboarded facilities</div><div className="metric-value">{summary.facilities}</div><div className="metric-foot">{summary.sites} registered branches and sites</div></div><div className="metric"><div className="metric-top">Configured staff</div><div className="metric-value">{summary.staff}</div><div className="metric-foot warn">{summary.requiredStaff - summary.staff} staffing gaps</div></div><div className="metric"><div className="metric-top">Tests today</div><div className="metric-value">{summary.testsToday}</div><div className="metric-foot good">Across {summary.departments} configured departments</div></div><div className="metric"><div className="metric-top">Network within TAT</div><div className="metric-value">{summary.withinTatPercent}%</div><div className="metric-foot good">Volume-weighted performance</div></div></div>

    <div className="network-chart-grid"><section className="panel"><div className="panel-head"><h2>Facility test volume</h2><span>Tests received today</span></div><div className="facility-volume-chart">{rows.map(row => <div key={row.code}><span>{row.code}</span><i><b style={{ width: `${row.testsToday / 2}%` }} /></i><strong>{row.testsToday}</strong></div>)}</div></section><section className="panel"><div className="panel-head"><h2>TAT target performance</h2><span>Percentage released within facility target</span></div><div className="facility-volume-chart tat-chart">{rows.map(row => <div key={row.code}><span>{row.code}</span><i><b className={row.withinTatPercent < 90 ? "warning" : ""} style={{ width: `${row.withinTatPercent}%` }} /></i><strong>{row.withinTatPercent}%</strong></div>)}</div></section></div>

    <section className="panel section-gap"><div className="panel-head"><div><h2>All onboarded facilities</h2><span>Operational aggregates and configuration coverage</span></div><span className="status blue">{summary.facilities} facilities · patient details excluded</span></div><div className="toolbar"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search facility, code or region" /><select value={region} onChange={event => setRegion(event.target.value)}><option>All regions</option>{[...new Set(rows.map(row => row.region))].map(item => <option key={item}>{item}</option>)}</select><button className="button small" onClick={() => { setQuery(""); setRegion("All regions"); }}>Reset</button></div><div className="table-wrap"><table><thead><tr><th>Facility</th><th>Sites</th><th>Staff configured</th><th>Departments</th><th>Tests today</th><th>Median / P95 TAT</th><th>Within target</th><th>QC</th><th>Uptime</th><th /></tr></thead><tbody>{filtered.map(row => <tr key={row.code}><td><strong>{row.name}</strong><span className="cell-sub">{row.code} · {row.region}</span></td><td>{row.sites}</td><td>{row.configuredStaff} / {row.requiredStaff}<span className="cell-sub">{Math.round(row.configuredStaff / row.requiredStaff * 100)}% configured</span></td><td>{row.departments}</td><td>{row.testsToday}</td><td>{row.medianTatMinutes} min / {row.p95TatMinutes} min</td><td><span className={`status ${row.withinTatPercent >= 90 ? "green" : row.withinTatPercent === 0 ? "gray" : "amber"}`}>{row.withinTatPercent}%</span></td><td><span className={`status ${row.qcState === "In control" ? "green" : row.qcState === "Setup" ? "gray" : "amber"}`}>{row.qcState}</span></td><td>{row.uptimePercent}%</td><td><a className="button small link-button" href={`/platform/facilities/${row.code.toLowerCase()}`}>View facility</a></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-table"><strong>No matching facilities</strong><span>Change the search or region filter.</span></div>}</div></section>
    {onboarding && <FacilityOnboarding existingCodes={rows.map(row => row.code)} onClose={() => setOnboarding(false)} onComplete={facility => { setRows(current => [facility, ...current]); setOnboarding(false); setQuery(facility.code); setRegion("All regions"); }} />}
  </div>;
}
