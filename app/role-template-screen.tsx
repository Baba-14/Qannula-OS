"use client";

import { useMemo, useState } from "react";
import type { RoleId } from "../lib/navigation";
import { dashboardWidgets, roleTemplates, validateRoleTemplate } from "../lib/role-templates";
import type { RoleCategory, RoleTemplate, SubscriptionTier } from "../lib/role-templates";

const categories: RoleCategory[] = ["Facility leadership", "Patient services", "Pre-lab", "Laboratory", "Post-lab", "Quality & resources", "External", "Governance"];
const previewRoutes: Record<string, string> = {
  pre_lab_scientist: "pre-lab", haematology_scientist: "haematology", chemistry_scientist: "chemistry",
  microbiology_scientist: "microbiology", verifier: "post-lab", quality_manager: "quality",
  cashier_claims: "cashier", specimen_courier: "courier", store_procurement: "stores",
  biomedical_officer: "biomedical", referral_coordinator: "referrals", ordering_clinician: "clinician",
  patient_portal: "patient-portal", branch_admin: "branch-admin", auditor: "auditor", privacy_officer: "privacy",
};
const initiallyActive = new Set(["facility_admin", "branch_admin", "lab_manager", "receptionist", "cashier_claims", "phlebotomist", "pre_lab_scientist", "specimen_courier", "haematology_scientist", "chemistry_scientist", "microbiology_scientist", "bench_scientist", "verifier", "quality_manager", "store_procurement", "biomedical_officer", "referral_coordinator"]);

function Metric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <div className="metric"><div className="metric-top">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{note}</div></div>;
}

function TemplateForm({ onClose, onSave }: { onClose: () => void; onSave: (template: RoleTemplate) => void }) {
  const [form, setForm] = useState({ id: "", name: "", category: "Patient services" as RoleCategory, description: "", dashboard: "", tier: "Professional" as SubscriptionTier, widgets: [] as string[], permissions: "" });
  const permissions = form.permissions.split("\n").map(item => item.trim()).filter(Boolean);
  const issues = validateRoleTemplate({ ...form, permissions });
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm(current => ({ ...current, [key]: value }));
  const toggleWidget = (widget: string) => update("widgets", form.widgets.includes(widget) ? form.widgets.filter(item => item !== widget) : [...form.widgets, widget]);
  return <div className="modal-backdrop" role="presentation"><form className="configuration-modal" role="dialog" aria-modal="true" aria-label="Create role template" onSubmit={event => { event.preventDefault(); if (!issues.length) onSave({ ...form, permissions, facilities: 0, staff: 0, status: "Draft", version: 1 }); }}>
    <div className="panel-head"><div><h2>Create role & dashboard template</h2><span>Define a reusable platform template. Facilities activate it; they do not rewrite its safety permissions.</span></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>
    <div className="form-grid"><label>Role name *<input value={form.name} onChange={event => update("name", event.target.value)} placeholder="e.g. Molecular Scientist" /></label><label>Role key *<input value={form.id} onChange={event => update("id", event.target.value.toLowerCase().replaceAll(" ", "_"))} placeholder="molecular_scientist" /></label><label>Category<select value={form.category} onChange={event => update("category", event.target.value as RoleCategory)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label><label>Subscription tier<select value={form.tier} onChange={event => update("tier", event.target.value as SubscriptionTier)}><option>Core</option><option>Professional</option><option>Enterprise</option></select></label><label className="wide">Description *<textarea value={form.description} onChange={event => update("description", event.target.value)} placeholder="Purpose, scope and boundaries of this role" /></label><label>Default dashboard *<input value={form.dashboard} onChange={event => update("dashboard", event.target.value)} placeholder="Molecular bench" /></label><label>Permissions · one per line *<textarea value={form.permissions} onChange={event => update("permissions", event.target.value)} placeholder={"molecular.worklist\nresult.enter\nrepeat.request"} /></label><fieldset className="widget-picker"><legend>Dashboard widgets *</legend>{dashboardWidgets.map(widget => <label key={widget}><input type="checkbox" checked={form.widgets.includes(widget)} onChange={() => toggleWidget(widget)} /> {widget}</label>)}</fieldset></div>
    {issues.length > 0 && <div className="form-issues">{issues.map(issue => <span key={issue}>• {issue}</span>)}</div>}
    <div className="modal-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button primary" disabled={issues.length > 0}>Save draft template</button></div>
  </form></div>;
}

function TemplateDetail({ template, onClose, onPublish, notify }: { template: RoleTemplate; onClose: () => void; onPublish: () => void; notify: (message: string) => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="configuration-modal" role="dialog" aria-modal="true" aria-label={`${template.name} template`}><div className="panel-head"><div><h2>{template.name}</h2><span>{template.id} · version {template.version} · {template.status}</span></div><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>
    {template.safetyLocked && <div className="clinical-warning"><strong>Safety controls are locked.</strong><span>Separation of duties, facility scope and clinical verification controls cannot be removed by a facility.</span></div>}
    <div className="detail-grid modal-detail"><div className="detail-card"><span>Dashboard</span><strong>{template.dashboard}</strong></div><div className="detail-card"><span>Tier</span><strong>{template.tier}</strong></div><div className="detail-card"><span>Adoption</span><strong>{template.facilities} facilities · {template.staff} accounts</strong></div><div className="detail-card"><span>Category</span><strong>{template.category}</strong></div></div>
    <div className="template-detail-columns"><div><strong>Default widgets</strong>{template.widgets.map(item => <span key={item}>✓ {item}</span>)}</div><div><strong>Permission bundle</strong>{template.permissions.map(item => <code key={item}>{item}</code>)}</div></div>
    <div className="modal-actions"><button className="button" onClick={() => notify(`${template.name} duplicated as an editable draft`)}>Duplicate</button>{template.status === "Draft" && <button className="button primary" onClick={onPublish}>Publish version {template.version}</button>}<button className="button" onClick={onClose}>Done</button></div>
  </div></div>;
}

export function RoleTemplateScreen({ role, notify }: { role: RoleId; notify: (message: string) => void }) {
  const owner = role === "main_admin";
  const [templates, setTemplates] = useState(roleTemplates);
  const [active, setActive] = useState(initiallyActive);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [tier, setTier] = useState("All tiers");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<RoleTemplate | null>(null);
  const visible = useMemo(() => templates.filter(template => (category === "All categories" || template.category === category) && (tier === "All tiers" || template.tier === tier) && Object.values(template).join(" ").toLowerCase().includes(query.toLowerCase())), [templates, category, tier, query]);
  const activeCount = templates.filter(template => active.has(template.id)).length;
  const assigned = templates.filter(template => active.has(template.id)).reduce((sum, template) => sum + template.staff, 0);
  const toggle = (template: RoleTemplate) => {
    if (template.required) return;
    setActive(current => { const next = new Set(current); next.has(template.id) ? next.delete(template.id) : next.add(template.id); return next; });
    notify(`${template.name} ${active.has(template.id) ? "deactivated" : "activated"} for Korle View Diagnostics`);
  };
  return <div className="content"><div className="page-head"><div><div className="eyebrow">{owner ? "Software owner / global governance" : "Facility administration / identity and access"}</div><h1>{owner ? "Role & dashboard library" : "Facility roles & dashboards"}</h1><p className="subtitle">{owner ? "Create the approved account types, permission bundles and dashboard templates every LabNett facility can use." : "Activate approved LabNett role templates for this facility, preview their dashboards and control which account types can be assigned."}</p></div><div className="button-row">{owner ? <button className="button primary" onClick={() => setCreating(true)}>+ Create role template</button> : <a className="button primary link-button" href="#role-register">Manage active roles</a>}</div></div>
    <div className="metric-grid">{owner ? <><Metric label="Global templates" value={templates.length} note={`${templates.filter(item => item.status === "Published").length} published`} /><Metric label="Safety-locked roles" value={templates.filter(item => item.safetyLocked).length} note="Clinical boundaries protected" /><Metric label="Facility adoption" value={templates.reduce((sum, item) => sum + item.facilities, 0)} note="Template activations" /><Metric label="Assigned accounts" value={templates.reduce((sum, item) => sum + item.staff, 0)} note="Across the LabNett network" /></> : <><Metric label="Active roles" value={`${activeCount} / ${templates.length}`} note="Available for account assignment" /><Metric label="Assigned staff" value={assigned} note="Across active templates" /><Metric label="Required roles" value={templates.filter(item => item.required).length} note="Cannot be deactivated" /><Metric label="Available to activate" value={templates.length - activeCount} note="Approved global templates" /></>}</div>
    <div className="governance-banner"><div><strong>{owner ? "Global template authority" : "Facility activation authority"}</strong><span>{owner ? "Publishing changes availability for facilities. Existing assignments remain versioned and auditable." : "You can activate templates and choose a safe widget subset. Global permissions and verification controls remain locked."}</span></div><span className="status blue">{owner ? "Platform scope" : "Korle View Diagnostics"}</span></div>
    <section className="panel" id="role-register"><div className="panel-head"><div><h2>{owner ? "Account types and dashboards" : "Approved facility account types"}</h2><span>{visible.length} templates shown</span></div></div><div className="toolbar"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search role, dashboard or permission" /><select value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select><select value={tier} onChange={event => setTier(event.target.value)}><option>All tiers</option><option>Core</option><option>Professional</option><option>Enterprise</option></select><button className="button small" onClick={() => { setQuery(""); setCategory("All categories"); setTier("All tiers"); }}>Reset</button></div>
      <div className="table-wrap"><table><thead><tr>{!owner && <th>Available</th>}<th>Role template</th><th>Category</th><th>Default dashboard</th><th>Widgets</th><th>Permissions</th><th>Tier</th><th>{owner ? "Adoption" : "Assigned"}</th><th>Status</th><th /></tr></thead><tbody>{visible.map(template => <tr key={template.id}>{!owner && <td><button className={`toggle ${active.has(template.id) ? "on" : ""}`} disabled={template.required} onClick={() => toggle(template)} aria-label={`${active.has(template.id) ? "Deactivate" : "Activate"} ${template.name}`}><i /></button>{template.required && <span className="cell-sub">Required</span>}</td>}<td><strong>{template.name}</strong><span className="cell-sub">{template.id} · v{template.version}{template.safetyLocked ? " · safety locked" : ""}</span></td><td>{template.category}</td><td><strong>{template.dashboard}</strong></td><td>{template.widgets.length}<span className="cell-sub">{template.widgets.slice(0, 2).join(" · ")}</span></td><td><code>{template.permissions[0]}</code><span className="cell-sub">+{template.permissions.length - 1} permissions</span></td><td><span className="status blue">{template.tier}</span></td><td>{owner ? `${template.facilities} facilities` : active.has(template.id) ? `${template.staff} staff` : "—"}</td><td><span className={`status ${owner ? template.status === "Published" ? "green" : "amber" : active.has(template.id) ? "green" : "gray"}`}>{owner ? template.status : active.has(template.id) ? "Active" : "Inactive"}</span></td><td><div className="button-row"><button className="button small" onClick={() => setSelected(template)}>{owner ? "Open" : "Details"}</button>{!owner && active.has(template.id) && previewRoutes[template.id] && <a className="button small link-button" href={`/workspace/${previewRoutes[template.id]}`}>Preview</a>}</div></td></tr>)}</tbody></table></div>
    </section>
    {!owner && <div className="assignment-preview section-gap"><strong>Account creation rule</strong><span>Only roles marked Active appear in Users & Assignments. Creating a role does not create a person’s account; the Facility Administrator invites the user and assigns facility, branch, unit and role scope separately.</span></div>}
    {creating && <TemplateForm onClose={() => setCreating(false)} onSave={template => { setTemplates(current => [template, ...current]); setCreating(false); notify(`${template.name} saved as a global draft`); }} />}
    {selected && <TemplateDetail template={selected} notify={notify} onClose={() => setSelected(null)} onPublish={() => { setTemplates(current => current.map(item => item.id === selected.id ? { ...item, status: "Published" } : item)); setSelected(null); notify(`${selected.name} published to the facility catalogue`); }} />}
  </div>;
}
