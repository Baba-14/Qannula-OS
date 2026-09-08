"use client";

import { useMemo, useState } from "react";
import type { SupportAccessRequest, SupportScope } from "../lib/support-access";
import { validateSupportAccess } from "../lib/support-access";
import type { View } from "../lib/navigation";
import { facilityPerformance, networkSummary, performanceCsv } from "../lib/platform-analytics";

type AccessState = "none" | "pending" | "approved" | "denied";
type Facility = { name: string; code: string; sites: number; users: number; plan: string; health: string; state: string; access: AccessState; expiry?: string };

const facilities: Facility[] = [
  { name: "LabNett Central", code: "LNC", sites: 3, users: 34, plan: "Enterprise", health: "Healthy", state: "Live", access: "none" },
  { name: "Korle View Diagnostics", code: "KVD", sites: 2, users: 22, plan: "Professional", health: "1 gateway warning", state: "Live", access: "none" },
  { name: "NorthStar Medical Lab", code: "NSM", sites: 1, users: 16, plan: "Professional", health: "Healthy", state: "Live", access: "approved", expiry: "20:58" },
  { name: "Coastal Screening Centre", code: "CSC", sites: 1, users: 8, plan: "Starter", health: "Setup incomplete", state: "Onboarding", access: "none" },
  { name: "Aseda Community Laboratory", code: "ACL", sites: 1, users: 11, plan: "Starter", health: "Healthy", state: "Live", access: "pending" },
];

const emptyRequest: SupportAccessRequest = { facility: "", ticket: "", reason: "", scope: "technical_diagnostics", durationMinutes: 30, approver: "", acknowledged: false };

function exportNetworkPerformance() {
  const blob = new Blob([performanceCsv(facilityPerformance)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `labnett-network-performance-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  URL.revokeObjectURL(url);
}

export function PlatformDashboard({ setView }: { setView: (view: View) => void }) {
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState(facilities);
  const [request, setRequest] = useState(emptyRequest);
  const [requesting, setRequesting] = useState(false);
  const summary = networkSummary(facilityPerformance);
  const issues = validateSupportAccess(request);
  const visible = useMemo(() => network.filter(facility => Object.values(facility).join(" ").toLowerCase().includes(query.toLowerCase())), [network, query]);
  const update = <K extends keyof SupportAccessRequest>(field: K, value: SupportAccessRequest[K]) => setRequest(current => ({ ...current, [field]: value }));
  const beginRequest = (facility: Facility) => {
    setRequest({ ...emptyRequest, facility: facility.name, ticket: `SUP-${2400 + network.findIndex(item => item.code === facility.code) + 10}` });
    setRequesting(true);
  };
  const submit = () => {
    if (issues.length) return;
    setNetwork(current => current.map(facility => facility.name === request.facility ? { ...facility, access: "pending", expiry: undefined } : facility));
    setRequesting(false);
    setRequest(emptyRequest);
  };

  return <div className="content platform-dashboard">
    <div className="page-head"><div><div className="eyebrow">LabNett / software owner</div><h1>Platform operations console</h1><p className="subtitle">Network-wide facility performance, adoption, TAT and service health without patient-identifiable data.</p></div><div className="button-row"><span className="platform-boundary">Privacy-safe platform view</span><button className="button" onClick={exportNetworkPerformance}>Export network CSV</button><button className="button primary" onClick={() => setView("facilities")}>Facility performance</button></div></div>

    <div className="metric-grid"><div className="metric"><div className="metric-top">Customer facilities / sites</div><div className="metric-value">{summary.facilities} / {summary.sites}</div><div className="metric-foot good">4 live · 1 onboarding</div></div><div className="metric"><div className="metric-top">Configured staff</div><div className="metric-value">{summary.staff}</div><div className="metric-foot warn">{summary.requiredStaff - summary.staff} open staffing positions</div></div><div className="metric"><div className="metric-top">Network tests today</div><div className="metric-value">{summary.testsToday}</div><div className="metric-foot">Across {summary.departments} departments</div></div><div className="metric"><div className="metric-top">Within target TAT</div><div className="metric-value">{summary.withinTatPercent}%</div><div className="metric-foot good">Volume-weighted network result</div></div></div>

    <div className="platform-health"><div><i className="green" /><span><strong>Cloud services</strong><small>All regions operational</small></span></div><div><i className="green" /><span><strong>Device gateways</strong><small>39 of 41 connected</small></span></div><div><i className="amber" /><span><strong>Support queue</strong><small>3 open · oldest 42 min</small></span></div><div><i className="green" /><span><strong>Backups</strong><small>Last verified 18 min ago</small></span></div></div>

    <div className="network-chart-grid section-gap"><section className="panel"><div className="panel-head"><h2>Tests by facility</h2><button className="text-action" onClick={() => setView("facilities")}>Full performance register</button></div><div className="facility-volume-chart">{facilityPerformance.map(row => <div key={row.code}><span>{row.code}</span><i><b style={{ width: `${row.testsToday / 2}%` }} /></i><strong>{row.testsToday}</strong></div>)}</div></section><section className="panel"><div className="panel-head"><h2>TAT comparison</h2><span>Released within configured facility target</span></div><div className="facility-volume-chart tat-chart">{facilityPerformance.map(row => <div key={row.code}><span>{row.code}</span><i><b className={row.withinTatPercent < 90 ? "warning" : ""} style={{ width: `${row.withinTatPercent}%` }} /></i><strong>{row.withinTatPercent}%</strong></div>)}</div></section></div>

    <section className="panel section-gap"><div className="panel-head"><div><h2>Customer network</h2><span>Search facilities and request controlled support access</span></div><button className="text-action" onClick={() => setView("facilities")}>Manage subscriptions and onboarding</button></div><div className="toolbar"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search facility, code, plan or service state" /><select><option>All service states</option><option>Live</option><option>Onboarding</option></select><select><option>All plans</option><option>Enterprise</option><option>Professional</option><option>Starter</option></select><span className="scope-lock">Clinical records hidden</span></div><div className="table-wrap"><table><thead><tr><th>Facility</th><th>Sites</th><th>Users</th><th>Plan</th><th>Service health</th><th>Support access</th><th /></tr></thead><tbody>{visible.map(facility => <tr key={facility.code}><td><strong>{facility.name}</strong><span className="cell-sub">{facility.code} · {facility.state}</span></td><td>{facility.sites}</td><td>{facility.users}</td><td>{facility.plan}</td><td><span className={`status ${facility.health === "Healthy" ? "green" : "amber"}`}>{facility.health}</span></td><td>{facility.access === "approved" ? <span className="status green">Approved · expires {facility.expiry}</span> : facility.access === "pending" ? <span className="status amber">Awaiting facility</span> : facility.access === "denied" ? <span className="status red">Denied</span> : <span className="status gray">No access</span>}</td><td>{facility.access === "approved" ? <a className="button small primary link-button" href="/facility">Open facility dashboard</a> : facility.access === "pending" ? <button className="button small" disabled>Request pending</button> : <button className="button small" onClick={() => beginRequest(facility)}>{facility.access === "denied" ? "Request again" : "Request support access"}</button>}</td></tr>)}</tbody></table></div></section>

    <div className="dashboard-grid section-gap"><section className="panel"><div className="panel-head"><div><h2>Support request queue</h2><span>Requests begin from a facility page</span></div><a className="text-action link-button" href="/platform/support">View all requests</a></div><div className="queue"><div className="queue-item"><div className="queue-symbol red">!</div><div className="queue-copy"><strong>Mindray gateway retries</strong><span>Korle View Diagnostics · SUP-2411</span></div><div className="queue-value">42 min</div><span className="status amber">Approval needed</span></div><div className="queue-item"><div className="queue-symbol blue">↔</div><div className="queue-copy"><strong>Catalogue import assistance</strong><span>Aseda Community Laboratory · SUP-2414</span></div><div className="queue-value">Pending</div><span className="status amber">Facility reviewing</span></div><div className="queue-item"><div className="queue-symbol blue">✓</div><div className="queue-copy"><strong>Report template maintenance</strong><span>NorthStar Medical Lab · SUP-2408</span></div><div className="queue-value">27 min left</div><span className="status green">Approved</span></div></div></section><section className="panel"><div className="panel-head"><h2>Access boundary</h2><span>Always enforced</span></div><div className="boundary-list"><p><i>✓</i><span><strong>Allowed</strong><small>Service health, subscriptions, configuration support and privacy-safe aggregates.</small></span></p><p><i className="red">×</i><span><strong>Not automatically allowed</strong><small>Patients, specimens, results, reports or any facility dashboard.</small></span></p><p><i>◷</i><span><strong>Approved sessions</strong><small>Facility-scoped, purpose-limited, audited and automatically expired.</small></span></p></div></section></div>

    {requesting && <div className="modal-backdrop" role="presentation"><form className="configuration-modal" role="dialog" aria-modal="true" aria-label="Request facility support access" onSubmit={event => { event.preventDefault(); submit(); }}><div className="panel-head"><div><h2>Request support access</h2><span>{request.facility} · the facility may approve or deny this request</span></div><button type="button" className="icon-btn" onClick={() => setRequesting(false)} aria-label="Close">×</button></div><div className="clinical-warning"><strong>You cannot view the facility dashboard until approval is granted.</strong><span>The session will be restricted to the selected scope and will end automatically after the requested time.</span></div><div className="form-grid"><label>Facility<input value={request.facility} disabled /></label><label>Support ticket *<input value={request.ticket} onChange={event => update("ticket", event.target.value)} /></label><label>Service required *<select value={request.scope} onChange={event => update("scope", event.target.value as SupportScope)}><option value="technical_diagnostics">Maintenance and technical diagnostics</option><option value="configuration_read">Configuration review only</option><option value="patient_record_read">Specific record investigation · read-only</option></select></label><label>Access time requested *<select value={request.durationMinutes} onChange={event => update("durationMinutes", Number(event.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour maximum</option></select></label><label>Facility approver *<input value={request.approver} onChange={event => update("approver", event.target.value)} placeholder="Administrator who will receive request" /></label><label className="wide">Why is access required? *<textarea value={request.reason} onChange={event => update("reason", event.target.value)} placeholder="Describe the maintenance issue and exactly what must be inspected or changed." /></label><label className="wide support-ack"><input type="checkbox" checked={request.acknowledged} onChange={event => update("acknowledged", event.target.checked)} /> I accept that access is monitored, fully audited, purpose-limited and automatically revoked.</label></div>{issues.length > 0 && <div className="form-issues">{issues.map(issue => <span key={issue}>• {issue}</span>)}</div>}<div className="modal-actions"><button type="button" className="button" onClick={() => setRequesting(false)}>Cancel</button><button type="submit" className="button primary" disabled={issues.length > 0}>Send request to facility</button></div></form></div>}
  </div>;
}
