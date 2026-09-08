"use client";

import { useState } from "react";
import type { SupportAccessRequest, SupportScope } from "../lib/support-access";
import { validateSupportAccess } from "../lib/support-access";

const initialRequest: SupportAccessRequest = { facility: "Korle View Diagnostics", ticket: "", reason: "", scope: "technical_diagnostics", durationMinutes: 30, approver: "", acknowledged: false };

export function PlatformGovernance() {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState(initialRequest);
  const [requestState, setRequestState] = useState("No active support access");
  const issues = validateSupportAccess(request);
  const update = <K extends keyof SupportAccessRequest>(field: K, value: SupportAccessRequest[K]) => setRequest(current => ({ ...current, [field]: value }));
  const submit = () => {
    if (issues.length) return;
    setRequestState(`Awaiting approval · ${request.facility} · ${request.durationMinutes} min`);
    setOpen(false);
    setRequest(initialRequest);
  };

  return <>
    <section className="panel section-gap"><div className="panel-head"><div><h2>Platform governance and support access</h2><span>Software-owner boundary · least privilege</span></div><button className="button" onClick={() => setOpen(true)}>Request controlled support access</button></div><div className="governance-grid"><div><span className="governance-icon allowed">✓</span><strong>Platform administration</strong><p>Facilities, subscriptions, global catalogue templates, integrations, security, system health and audit oversight.</p></div><div><span className="governance-icon blocked">×</span><strong>Clinical boundary</strong><p>No routine patient creation, specimen handling, result entry, verification or report release through the software-owner role.</p></div><div><span className="governance-icon timed">◷</span><strong>Temporary support only</strong><p>Facility-approved, ticket-linked access expires automatically and cannot grant clinical authorization.</p></div></div><div className="support-state"><div><span>Current access state</span><strong>{requestState}</strong></div><div><span>Last completed session</span><strong>SUP-2381 · 22 min · expired 07 Sep 16:42</strong></div><div><span>Audit coverage</span><strong>Screen access, searches and changes recorded</strong></div></div></section>

    {open && <div className="modal-backdrop" role="presentation"><form className="configuration-modal" role="dialog" aria-modal="true" aria-label="Request controlled support access" onSubmit={event => { event.preventDefault(); submit(); }}><div className="panel-head"><div><h2>Request controlled support access</h2><span>This does not grant clinical verification or release permissions.</span></div><button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">×</button></div><div className="clinical-warning"><strong>Patient information is owned and controlled by the facility.</strong><span>Use this only to resolve an approved support incident. Every view, search and change will be audited.</span></div><div className="form-grid"><label>Facility *<select value={request.facility} onChange={event => update("facility", event.target.value)}><option>Korle View Diagnostics</option><option>LabNett Central</option><option>NorthStar Medical Lab</option></select></label><label>Support ticket *<input value={request.ticket} onChange={event => update("ticket", event.target.value)} placeholder="SUP-0000" /></label><label>Requested scope *<select value={request.scope} onChange={event => update("scope", event.target.value as SupportScope)}><option value="configuration_read">Configuration read-only</option><option value="technical_diagnostics">Technical diagnostics</option><option value="patient_record_read">Specific patient record read-only</option></select></label><label>Duration *<select value={request.durationMinutes} onChange={event => update("durationMinutes", Number(event.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>60 minutes maximum</option></select></label><label>Facility approver *<input value={request.approver} onChange={event => update("approver", event.target.value)} placeholder="Named facility administrator" /></label><label className="wide">Detailed reason *<textarea value={request.reason} onChange={event => update("reason", event.target.value)} placeholder="Describe the incident, affected component and why this scope is required." /></label><label className="wide support-ack"><input type="checkbox" checked={request.acknowledged} onChange={event => update("acknowledged", event.target.checked)} /> I understand this session is monitored, audited, facility-scoped and automatically expires.</label></div>{issues.length > 0 && <div className="form-issues">{issues.map(issue => <span key={issue}>• {issue}</span>)}</div>}<div className="modal-actions"><button type="button" className="button" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="button primary" disabled={issues.length > 0}>Submit for facility approval</button></div></form></div>}
  </>;
}
