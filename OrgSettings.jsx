// Org Settings — single-workspace mode (3.0 UX brief v2 — Default Workspace
// Model). Reached from the profile footer menu. Sub-nav: Policies / General
// (no Workspaces tab in single-workspace mode). User management lives on its
// own standalone surface (?view=users), NOT as a tab here. Only Owners can
// assign or revoke the Global Admin role.

const ORG_POLICY_CONFIG = {
  "Runtime Integrity Policy": {
    icon: "verified_user",
    description: "Attestation requirements every workflow in the org must satisfy before it can execute on confidential compute.",
    fields: [
    { label: "Enforcement", type: "radio", value: "Enforce", options: ["Enforce", "Audit only", "Disabled"] },
    { label: "Required attestation source", type: "select", value: "Opaque Confidential Runtime v2",
      options: ["Opaque Confidential Runtime v2", "Opaque Confidential Runtime v1", "AMD SEV-SNP", "Intel TDX"] },
    { label: "Minimum runtime version", type: "text", value: "2.14.0" },
    { label: "Trusted signers", type: "tags", value: ["opaque-prod", "opaque-staging"] },
    { label: "Block on failed attestation", type: "toggle", value: true },
    { label: "Notify security on failure", type: "toggle", value: true }]

  },
  "Network Policy": {
    icon: "lan",
    description: "Egress and ingress rules inherited by every workflow in the org. Individual workflows may request overrides for allow-listed destinations.",
    fields: [
    { label: "Default egress", type: "radio", value: "Deny", options: ["Deny", "Allow-listed only", "Allow all"] },
    { label: "Allowed egress destinations", type: "tags", value: ["api.opaque.co", "*.salesforce.com", "internal-s3.opaque.co"] },
    { label: "Allowed ingress", type: "radio", value: "Internal VPC only", options: ["Internal VPC only", "Org members", "Public"] },
    { label: "Require mTLS for external calls", type: "toggle", value: true },
    { label: "Log all blocked requests", type: "toggle", value: true },
    { label: "Max request size (MB)", type: "text", value: "25" }]

  }
};

const ORG_USERS = [
{ name: "Annemarie Selaya", email: "annemarie@opaque.co", role: "Owner", added: "12 Mar 2025", last: "Today" },
{ name: "Evan McMillon", email: "evan@opaque.co", role: "Global Admin", added: "18 Mar 2025", last: "Today" },
{ name: "Deborah Mercy", email: "deborah@opaque.co", role: "Global Admin", added: "02 Apr 2025", last: "Yesterday" },
{ name: "Janice Johnson", email: "janice@opaque.co", role: "Member", added: "09 Apr 2025", last: "2 days ago" },
{ name: "Priya Manikandan", email: "priya@opaque.co", role: "Member", added: "14 Apr 2025", last: "Today" },
{ name: "Jordan Bellamy", email: "jordan@opaque.co", role: "Member", added: "22 Apr 2025", last: "4 days ago" },
{ name: "Maya Ramirez", email: "maya@opaque.co", role: "Member", added: "03 May 2025", last: "1 week ago" },
{ name: "Noah Westergaard", email: "noah@opaque.co", role: "Member", added: "12 May 2025", last: "Today" },
{ name: "Devon Oduya", email: "devon@opaque.co", role: "Member", added: "28 May 2025", last: "Today" },
{ name: "Kiran Patel", email: "kiran@opaque.co", role: "Member", added: "06 Jun 2025", last: "3 days ago" },
{ name: "Isabel Cortez", email: "isabel@opaque.co", role: "Member", added: "21 Jun 2025", last: "1 week ago" },
{ name: "Ben Tatsumi", email: "ben@opaque.co", role: "Member", added: "14 Jul 2025", last: "Yesterday" }];


// ---------- shared controls ----------

const OSToggle = ({ on, onChange }) =>
<button type="button" className={`opq-toggle${on ? " on" : ""}`} onClick={() => onChange && onChange(!on)}>
    <span className="opq-toggle-knob" />
  </button>;


const OSPolicyField = ({ field }) => {
  const [val, setVal] = React.useState(field.value);
  if (field.type === "radio") {
    return (
      <div className="pf-control pf-radio-group">
        {field.options.map((o) =>
        <button key={o} type="button" className={`pf-radio${val === o ? " active" : ""}`} onClick={() => setVal(o)}>
            <span className="pf-radio-dot" />
            <span>{o}</span>
          </button>
        )}
      </div>);

  }
  if (field.type === "select") {
    return (
      <button type="button" className="pf-select">
        <span>{val}</span>
        <Icon name="expand_more" size={18} />
      </button>);

  }
  if (field.type === "text") {
    return <input className="pf-text" value={val} onChange={(e) => setVal(e.target.value)} />;
  }
  if (field.type === "tags") {
    return (
      <div className="pf-tags">
        {val.map((t) =>
        <span key={t} className="pf-tag">
            <span>{t}</span>
            <button type="button" className="pf-tag-x" aria-label={`Remove ${t}`}><Icon name="close" size={14} /></button>
          </span>
        )}
        <button type="button" className="pf-tag-add"><Icon name="add" size={14} /><span>Add</span></button>
      </div>);

  }
  if (field.type === "toggle") return <OSToggle on={val} onChange={setVal} />;
  return null;
};

const OSPolicyCard = ({ name, config }) =>
<section className="policy-card">
    <header className="policy-card-head">
      <div className="policy-card-title">
        <Icon name={config.icon} size={20} />
        <h2>{name}</h2>
      </div>
      <Chip variant="success">Enforced</Chip>
    </header>
    <p className="policy-card-desc">{config.description}</p>
    <div className="policy-fields">
      {config.fields.map((f) =>
    <div key={f.label} className={`policy-field policy-field--${f.type}`}>
          <label className="pf-label">{f.label}</label>
          <div className="pf-body"><OSPolicyField field={f} /></div>
        </div>
    )}
    </div>
  </section>;


// ---------- Policies tab ----------

const OrgPoliciesTab = () =>
<div className="policies-tab">
    <div className="policies-intro">
      <h2>Org policy baseline</h2>
      <p>These policies form the org-level baseline inherited by every workflow. Individual workflows may request overrides, but cannot weaken enforcement below the baseline.



    </p>
    </div>
    {Object.entries(ORG_POLICY_CONFIG).map(([name, config]) =>
  <OSPolicyCard key={name} name={name} config={config} />
  )}
  </div>;


// ---------- Integration access catalog (mirrors Registry seed data) ----------

const INTEGRATION_CATALOG = [
  { name: "HR Policies Corpus", type: "Data Connectors", icon: "database" },
  { name: "Salesforce CRM",     type: "Data Connectors", icon: "database" },
  { name: "Confluence Wiki",    type: "Data Connectors", icon: "database" },
  { name: "Web Search",         type: "Agent Tools",     icon: "construction" },
  { name: "SQL Query Tool",     type: "Agent Tools",     icon: "construction" },
  { name: "Code Interpreter",   type: "Agent Tools",     icon: "construction" },
  { name: "Claude Sonnet 4.5",  type: "Models",          icon: "network_intel_node" },
  { name: "Claude Haiku 4.5",   type: "Models",          icon: "network_intel_node" },
  { name: "Claude Opus 4",      type: "Models",          icon: "network_intel_node" },
];

// Grants keyed by integration name → list of { email, view, use }. Mirrors
// Registry's DEFAULT_GRANTS so both surfaces tell the same story.
const INTEGRATION_GRANTS = {
  "HR Policies Corpus": [
    { email: "annemarie@opaque.co", view: true, use: true },
    { email: "priya@opaque.co",     view: true, use: true },
    { email: "jordan@opaque.co",    view: true, use: false },
  ],
  "Salesforce CRM": [
    { email: "deborah@opaque.co", view: true, use: true },
    { email: "maya@opaque.co",    view: true, use: true },
  ],
  "Claude Sonnet 4.5": [
    { email: "annemarie@opaque.co", view: true, use: true },
    { email: "evan@opaque.co",      view: true, use: true },
    { email: "jordan@opaque.co",    view: true, use: true },
    { email: "maya@opaque.co",      view: true, use: false },
  ],
};

// Invert the grant map into a per-user list of integration permissions.
// A user has access to a integration if any grant exists for them on it.
const permissionsForUser = (email) =>
  INTEGRATION_CATALOG.map((res) => {
    const g = (INTEGRATION_GRANTS[res.name] || []).find((x) => x.email === email);
    return { ...res, access: !!(g && (g.view || g.use)) };
  });

const UserPermToggle = ({ on, onChange }) => (
  <button type="button" className={`opq-toggle${on ? " on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
    <span className="opq-toggle-knob" />
  </button>
);

const UserPermissionsDetail = ({ user, onBack }) => {
  const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const [perms, setPerms] = React.useState(() => permissionsForUser(user.email));

  const update = (name, access) => setPerms((ps) => ps.map((p) =>
    p.name === name ? { ...p, access } : p
  ));

  const grouped = ["Data Connectors", "Agent Tools", "Models"].map((type) => ({
    type,
    rows: perms.filter((p) => p.type === type),
  }));

  const accessCount = perms.filter((p) => p.access).length;

  return (
    <>
      <div className="wd-page-header">
        <div className="wd-breadcrumb">
          <button className="icon-btn" onClick={onBack} title="Back">
            <Icon name="arrow_back" size={20} />
          </button>
          <a className="wd-crumb-parent" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>User Management</a>
          <span className="wd-crumb-sep">/</span>
          <span className="wd-crumb-current">{user.name}</span>
        </div>
      </div>

      <div className="scroll">
        <div className="page-body">
          <div className="ra-head">
            <span className="member-avatar up-avatar">{initials(user.name)}</span>
            <div className="ra-head-text">
              <h1 className="ra-title">{user.name}</h1>
              <div className="ra-meta">
                <span>{user.email}</span>
                <span className="ra-dot">·</span>
                <Chip variant={opqRoleChip(user.role)}>{user.role}</Chip>
              </div>
            </div>
          </div>

          <section className="ra-section">
            <div className="ra-section-head">
              <div>
                <h2 className="ra-section-title">Integration permissions</h2>
                <p className="ra-section-desc">
                  Which integrations <strong>{user.name.split(" ")[0]}</strong> can use as a node in their agents.
                </p>
              </div>
            </div>

            <div className="ra-summary">
              <span><strong>{accessCount}</strong> of {perms.length} integrations accessible</span>
            </div>

            <div className="table-wrap">
              <table className="opq-table wf-table ra-table">
                <thead>
                  <tr>
                    <th>Integration</th>
                    <th className="ra-col-toggle">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((group) => (
                    <React.Fragment key={group.type}>
                      <tr className="up-group-row">
                        <td colSpan={2}>{group.type}</td>
                      </tr>
                      {group.rows.map((p) => (
                        <tr key={p.name}>
                          <td>
                            <div className="up-res-cell">
                              <span className="up-res-icon"><Icon name={p.icon} size={18} /></span>
                              <span className="member-name">{p.name}</span>
                            </div>
                          </td>
                          <td className="ra-col-toggle">
                            <UserPermToggle on={p.access} onChange={(v) => update(p.name, v)} />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

// ---------- Users tab ----------

const ROLE_OPTIONS = ["Owner", "Global Admin", "Member"];

// Role cell: a chip for everyone; an editable menu for Owners only
// (brief: only Owners can assign or revoke the Global Admin role).
const RoleCell = ({ role, canEdit, open, onToggle, onPick }) => {
  if (!canEdit) return <Chip variant={opqRoleChip(role)}>{role}</Chip>;
  return (
    <span className="os-role-edit" style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <button className="os-role-chip-btn" onClick={onToggle} title="Change role">
        <Chip variant={opqRoleChip(role)}>{role}</Chip>
        <Icon name="expand_more" size={16} />
      </button>
      {open &&
        <div className="reg-row-menu os-role-menu" onClick={(e) => e.stopPropagation()}>
          {ROLE_OPTIONS.map((r) => (
            <button key={r} onClick={() => onPick(r)}>
              <Icon name={r === role ? "check" : "remove"} size={16} style={{ opacity: r === role ? 1 : 0 }} />
              <span>{r}</span>
            </button>
          ))}
        </div>
      }
    </span>
  );
};

const OrgUsersTab = ({ onOpen }) => {
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("All roles");
  const [roles, setRoles] = React.useState(() =>
    Object.fromEntries(ORG_USERS.map((u) => [u.email, u.role])));
  const [roleMenu, setRoleMenu] = React.useState(null);
  const ROLES = ["All roles", "Owner", "Global Admin", "Member"];
  const ownerView = opqIsOwner();

  React.useEffect(() => {
    if (roleMenu === null) return;
    const onDoc = () => setRoleMenu(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [roleMenu]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORG_USERS.filter((m) => {
      if (roleFilter !== "All roles" && roles[m.email] !== roleFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [query, roleFilter, roles]);

  const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="members-tab">
      <div className="os-access-note">
        <Icon name="info" size={18} />
        <span>
          Manage who belongs to your organization and the role they hold. Integration- and
          agent-level access is granted per object in Registry and Agent Studio.
          {ownerView
            ? " As an Owner, you can assign or revoke the Global Admin role."
            : " Only Owners can assign or revoke the Global Admin role."}
        </span>
      </div>

      <div className="filter-bar">
        <label className="search-field">
          <input placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Icon name="search" size={18} />
        </label>
        <div className="type-filters">
          {ROLES.map((r) =>
          <button key={r} className={`type-filter${roleFilter === r ? " active" : ""}`} onClick={() => setRoleFilter(r)}>
              {r}
            </button>
          )}
        </div>
        <div className="spacer" />
        <Button variant="primary" icon={null} size="sm">Invite user</Button>
      </div>

      <div className="table-wrap">
        <table className="opq-table wf-table">
          <thead>
            <tr>
              <th className="sortable"><span className="th-inner"><span>User</span><span className="sort-ind material-symbols-outlined">arrow_upward</span></span></th>
              <th className="sortable"><span className="th-inner"><span>Role</span><span className="sort-ind material-symbols-outlined">arrow_upward</span></span></th>
              <th className="sortable"><span className="th-inner"><span>Added</span><span className="sort-ind material-symbols-outlined">arrow_upward</span></span></th>
              <th className="sortable last"><span className="th-inner"><span>Last active</span><span className="sort-ind material-symbols-outlined">arrow_upward</span></span></th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) =>
            <tr key={m.email} className="up-row" onClick={() => onOpen && onOpen({ ...m, role: roles[m.email] })}>
                <td>
                  <div className="member-cell">
                    <span className="member-avatar">{initials(m.name)}</span>
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <RoleCell
                    role={roles[m.email]}
                    canEdit={ownerView}
                    open={roleMenu === m.email}
                    onToggle={(e) => { e.stopPropagation(); setRoleMenu(roleMenu === m.email ? null : m.email); }}
                    onPick={(r) => { setRoles((rs) => ({ ...rs, [m.email]: r })); setRoleMenu(null); }}
                  />
                </td>
                <td className="cell-muted">{m.added}</td>
                <td className="cell-muted">{m.last}</td>
                <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn" title="View permissions" onClick={() => onOpen && onOpen({ ...m, role: roles[m.email] })}><Icon name="chevron_right" size={20} /></button>
                </td>
              </tr>
            )}
            {filtered.length === 0 &&
            <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "48px 12px", color: "var(--opq-ink-400)" }}>
                  No users match your filters.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>);

};

// ---------- General tab ----------

const OSGeneralRow = ({ label, hint, children }) =>
<div className="os-gen-row">
    <div className="os-gen-label">
      <div className="os-gen-label-main">{label}</div>
      {hint && <div className="os-gen-hint">{hint}</div>}
    </div>
    <div className="os-gen-control">{children}</div>
  </div>;


const OrgGeneralTab = () => {
  const [name, setName] = React.useState("Opaque Systems");
  const [desc, setDesc] = React.useState("Confidential AI platform for regulated enterprises.");
  const ownerView = opqIsOwner();
  return (
    <div className="os-general">
      <section className="os-gen-section">
        <h2>Organization</h2>
        <div className="os-gen-card">
          <OSGeneralRow label="Organization name" hint="Shown across the console and on exported records.">
            <input className="pf-text os-gen-input" value={name} onChange={(e) => setName(e.target.value)} />
          </OSGeneralRow>
          <OSGeneralRow label="Description" hint="A short summary of your organization.">
            <textarea className="pf-text os-gen-input" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </OSGeneralRow>
          <OSGeneralRow label="Organization ID" hint="Immutable identifier used by the CLI and API.">
            <code className="os-gen-mono">org-9f4a-2026</code>
          </OSGeneralRow>
          <OSGeneralRow label="Default cluster" hint={ownerView ? "New workflows deploy here unless overridden. Cluster management is Owner-only." : "New workflows deploy here unless overridden."}>
            <button type="button" className="pf-select os-gen-select">
              <span>US-East Prod</span>
              <Icon name="expand_more" size={18} />
            </button>
          </OSGeneralRow>
          <OSGeneralRow label="Governance Record signing key" hint="Root key used to sign exported Governance Records.">
            <code className="os-gen-mono">rk-prod-9f4a</code>
          </OSGeneralRow>
        </div>
      </section>

      {ownerView ? (
        <section className="os-gen-section">
          <h2>Danger zone</h2>
          <div className="os-gen-card os-gen-danger">
            <OSGeneralRow label="Delete organization" hint="Permanently removes all workflows, integrations, and records. This cannot be undone.">
              <Button variant="destructive" size="sm">Delete organization</Button>
            </OSGeneralRow>
          </div>
        </section>
      ) : (
        <section className="os-gen-section">
          <h2>Danger zone</h2>
          <div className="os-gen-card">
            <OSGeneralRow label="Delete organization" hint="Only the Owner can delete this organization.">
              <Button variant="destructive" size="sm" disabled>Delete organization</Button>
            </OSGeneralRow>
          </div>
        </section>
      )}
    </div>);

};

// ---------- Shell ----------

// ---------- Workspaces tab (multi-workspace mode only) ----------
// The consolidated home for workspace governance: list of org workspaces (the
// default workspace carries a badge and cannot be archived), a create CTA, and
// row-level lifecycle actions. Workspace MEMBERSHIP is managed in User
// Management; this surface owns workspace lifecycle (create / rename / archive).

const ORG_WORKSPACES_META = {
  "Opaque Systems":     { cluster: "US-East Prod", members: 24, created: "12 Mar 2025" },
  "Finance Department": { cluster: "US-East Prod", members: 8,  created: "04 Feb 2026" },
  "HR Internal":        { cluster: "US-East Prod", members: 6,  created: "18 Feb 2026" },
  "Sales & Marketing":  { cluster: "EU-West Prod", members: 11, created: "22 Apr 2026" },
};

const OrgWorkspacesTab = () => {
  const [openMenu, setOpenMenu] = React.useState(null);
  React.useEffect(() => {
    if (openMenu === null) return;
    const onDoc = () => setOpenMenu(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openMenu]);

  return (
    <div className="members-tab">
      <div className="os-access-note">
        <Icon name="info" size={18} />
        <span>Workspaces isolate teams, use cases, and compliance scopes. The default workspace is auto-provisioned and cannot be archived.</span>
      </div>
      <div className="filter-bar">
        <div className="spacer" />
        <Button variant="primary" icon="add" size="sm">New workspace</Button>
      </div>
      <div className="table-wrap">
        <table className="opq-table wf-table">
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "56px" }} />
          </colgroup>
          <thead>
            <tr>
              <th><span className="th-inner"><span>Workspace</span></span></th>
              <th><span className="th-inner"><span>Cluster</span></span></th>
              <th><span className="th-inner"><span>Members</span></span></th>
              <th className="last"><span className="th-inner"><span>Created</span></span></th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {OPQ_WORKSPACES.map((w) => {
              const m = ORG_WORKSPACES_META[w.name] || {};
              return (
                <tr key={w.name}>
                  <td>
                    <span className="ws-row-name">
                      <span className="ws-initials">{w.initials}</span>
                      <span className="reg-name">{w.name}</span>
                      {w.isDefault && <span className="ws-default-badge">Default</span>}
                    </span>
                  </td>
                  <td className="reg-muted">{m.cluster}</td>
                  <td>
                    <span className="reg-access-count"><Icon name="group" size={16} /><span>{m.members}</span></span>
                  </td>
                  <td className="reg-muted">{m.created}</td>
                  <td className="actions-col" style={{ position: "relative" }}>
                    <button className="icon-btn" title="More" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === w.name ? null : w.name); }}>
                      <Icon name="more_vert" size={18} />
                    </button>
                    {openMenu === w.name &&
                      <div className="reg-row-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenMenu(null)}><Icon name="edit" size={16} /><span>Edit details</span></button>
                        {w.isDefault
                          ? <button disabled><Icon name="lock" size={16} /><span>Default · can’t archive</span></button>
                          : <button className="reg-row-menu-danger" onClick={() => setOpenMenu(null)}><Icon name="archive" size={16} /><span>Archive</span></button>}
                      </div>}
                  </td>
                </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>);
};

// Two destinations share this file (both gated to Owner/Global Admin):
//   ?view=users       -> User Management (org-wide role management)
//   ?view=workspaces  -> Org Settings, Workspaces tab (multi-workspace mode)
//   default           -> Org Settings (Policies / General; +Workspaces in multi)
const OrgSettings = () => {
  const view = (() => {
    try { return new URLSearchParams(window.location.search).get("view"); }
    catch (e) { return null; }
  })();
  const isUsersView = view === "users";
  const multi = opqIsMulti();
  const tabList = multi ? ["Workspaces", "Policies", "General"] : ["Policies", "General"];
  const initialTab = (multi && view === "workspaces") ? "Workspaces" : "Policies";
  const [tab, setTab] = React.useState(initialTab);
  const [openUser, setOpenUser] = React.useState(null);

  // Members have no access (brief). Nav hides it; guard here too.
  if (!opqIsAdmin()) {
    return <NoAccess title={isUsersView ? "User Management" : "Org Settings"} area={isUsersView ? "User Management" : "Org Settings"} />;
  }

  if (openUser) {
    return <UserPermissionsDetail user={openUser} onBack={() => setOpenUser(null)} />;
  }

  if (isUsersView) {
    return (
      <>
        <PageHeader title="User Management" />
        <div className="scroll">
          <div className="page-body">
            <OrgUsersTab onOpen={setOpenUser} />
          </div>
        </div>
      </>);
  }

  return (
    <>
      <PageHeader
        title="Org Settings"
        tabs={tabList}
        activeTab={tab}
        onTab={setTab} />
      
      <div className="scroll">
        <div className="page-body">
          {tab === "Workspaces" && <OrgWorkspacesTab />}
          {tab === "Policies" && <OrgPoliciesTab />}
          {tab === "General" && <OrgGeneralTab />}
        </div>
      </div>
    </>);

};

Object.assign(window, { OrgSettings });