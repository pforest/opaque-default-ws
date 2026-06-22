// Agent Studio — home surface (3.0 UX brief v2, single-workspace mode).
// Two tabs: Workflows (default) + Integrations. The default workspace is implicit,
// so there is no workspace context indicator anywhere on this surface.
// Workflow status is Draft / Deployed; a Trust badge reflects latest attestation.
// Members see only workflows they have access to; Owners/Global Admins see all.

const WORKFLOWS = [
  { name: "Employee HR Assist",    createdBy: "Annemarie Selaya",  status: "Deployed", trust: "Verified", updated: "14 Apr 2026", member: true },
  { name: "Employee HR Assist V2", createdBy: "Evan McMillon",     status: "Deployed", trust: "Failed",   updated: "12 Feb 2026", member: true },
  { name: "Financial RAG",         createdBy: "Deborah Mercy",     status: "Deployed", trust: "Verified", updated: "24 Jan 2026" },
  { name: "Marketing Copilot",     createdBy: "Jordan Bellamy",    status: "Draft",    trust: null,       updated: "18 Jan 2026", member: true },
  { name: "Support Triage Agent",  createdBy: "Noah Westergaard",  status: "Draft",    trust: null,       updated: "09 Jan 2026" },
];

const ROWS_PER_PAGE = 10;

// ---------------- Agent access control (object-level) ----------------
// Mirrors the Integrations access pattern in Registry: per-agent user grants,
// surfaced as an Access count in the list and managed in a drill-in detail.

const WF_USERS = [
  { name: "Annemarie Selaya",   email: "annemarie@opaque.co", role: "Owner" },
  { name: "Evan McMillon",      email: "evan@opaque.co",      role: "Global Admin" },
  { name: "Deborah Mercy",      email: "deborah@opaque.co",   role: "Global Admin" },
  { name: "Janice Johnson",     email: "janice@opaque.co",    role: "Member" },
  { name: "Priya Manikandan",   email: "priya@opaque.co",     role: "Member" },
  { name: "Jordan Bellamy",     email: "jordan@opaque.co",    role: "Member" },
  { name: "Maya Ramirez",       email: "maya@opaque.co",      role: "Member" },
  { name: "Noah Westergaard",   email: "noah@opaque.co",      role: "Member" },
  { name: "Devon Oduya",        email: "devon@opaque.co",     role: "Member" },
  { name: "Kiran Patel",        email: "kiran@opaque.co",     role: "Member" },
  { name: "Isabel Cortez",      email: "isabel@opaque.co",    role: "Member" },
  { name: "Ben Tatsumi",        email: "ben@opaque.co",       role: "Member" },
];

// Seed grants per agent so the surface feels populated. Keyed by name;
// anything not listed starts empty.
const WF_AGENT_GRANTS = {
  "Employee HR Assist": [
    { email: "annemarie@opaque.co", access: true },
    { email: "priya@opaque.co",     access: true },
    { email: "jordan@opaque.co",    access: true },
  ],
  "Employee HR Assist V2": [
    { email: "evan@opaque.co",      access: true },
    { email: "annemarie@opaque.co", access: true },
  ],
  "Financial RAG": [
    { email: "deborah@opaque.co",   access: true },
    { email: "maya@opaque.co",      access: true },
    { email: "noah@opaque.co",      access: false },
  ],
  "Marketing Copilot": [
    { email: "jordan@opaque.co",    access: true },
  ],
};

// ---------------- Studio Integrations tab (consumption catalog) ----------------
// In single-workspace mode every org-registered integration is auto-bound to the
// default workspace, so this surface shows the full org pool. There is no
// workspace-binding UI. Integrations are registered in Registry; Global Admins
// and Owners can also register contextually here (save back to registry).
const STUDIO_INTEGRATIONS = [
  { name: "HR Policies Corpus", type: "Data Connectors", source: "PostgreSQL",          updated: "18 Apr 2026" },
  { name: "Salesforce CRM",     type: "Data Connectors", source: "Salesforce",          updated: "12 Apr 2026" },
  { name: "Confluence Wiki",    type: "Data Connectors", source: "Atlassian",           updated: "09 Apr 2026" },
  { name: "Web Search",         type: "Agent Tools",     source: "Brave",               updated: "11 Apr 2026" },
  { name: "SQL Query Tool",     type: "Agent Tools",     source: "Finance Ledger",      updated: "07 Apr 2026" },
  { name: "Code Interpreter",   type: "Agent Tools",     source: "Sandboxed runtime",   updated: "26 Mar 2026" },
  { name: "Claude Sonnet 4.5",  type: "Models",          source: "Anthropic",           updated: "14 Apr 2026" },
  { name: "Claude Haiku 4.5",   type: "Models",          source: "Anthropic",           updated: "04 Apr 2026" },
  { name: "Claude Opus 4",      type: "Models",          source: "Anthropic",           updated: "14 Mar 2026" },
];

// Object-level access grants (mirror Registry/Org Settings). A user can use a
// integration as a node only if granted. Members see only what they can use.
const STUDIO_RES_GRANTS = {
  "HR Policies Corpus": ["annemarie@opaque.co", "priya@opaque.co", "jordan@opaque.co"],
  "Salesforce CRM":     ["deborah@opaque.co", "maya@opaque.co"],
  "Claude Sonnet 4.5":  ["annemarie@opaque.co", "evan@opaque.co", "jordan@opaque.co", "maya@opaque.co"],
};
// Platform-provided integrations every member can use without an explicit grant.
const STUDIO_RES_OPEN = new Set(["Web Search", "Code Interpreter", "Claude Haiku 4.5"]);

const studioIntegrationsFor = (email) =>
  STUDIO_INTEGRATIONS.filter((r) =>
    STUDIO_RES_OPEN.has(r.name) || (STUDIO_RES_GRANTS[r.name] || []).includes(email));

const TYPE_FILTERS_STUDIO = ["All types", "Data Connectors", "Agent Tools", "Models"];
const TYPE_ICONS_STUDIO = { "Data Connectors": "database", "Agent Tools": "construction", "Models": "network_intel_node" };

// Owners + Global Admins, surfaced in the Member empty state with mailto links.
const wfAdminDirectory = () => WF_USERS.filter((u) => u.role === "Owner" || u.role === "Global Admin");

const wfInitialsOf = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const wfUserByEmail = (email) => WF_USERS.find((u) => u.email === email);
const wfAccessCountFor = (name) => (WF_AGENT_GRANTS[name] || []).filter((g) => g.access).length;

const WFAccessToggle = ({ on, onChange, disabled }) => (
  <button
    type="button"
    className={`opq-toggle${on ? " on" : ""}${disabled ? " disabled" : ""}`}
    onClick={() => !disabled && onChange(!on)}
    aria-pressed={on}
    disabled={disabled}
  >
    <span className="opq-toggle-knob" />
  </button>
);

const WFAddUserMenu = ({ candidates, onAdd, onClose }) => {
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const filtered = candidates.filter((u) =>
    u.name.toLowerCase().includes(q.trim().toLowerCase()) ||
    u.email.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="ra-add-menu" ref={ref}>
      <label className="ra-add-search">
        <Icon name="search" size={16} />
        <input autoFocus placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="ra-add-list">
        {filtered.map((u) => (
          <button key={u.email} className="ra-add-item" onClick={() => onAdd(u.email)}>
            <span className="member-avatar">{wfInitialsOf(u.name)}</span>
            <span className="ra-add-text">
              <span className="member-name">{u.name}</span>
              <span className="member-email">{u.email}</span>
            </span>
            <Icon name="add" size={18} />
          </button>
        ))}
        {filtered.length === 0 && <div className="ra-add-empty">No users to add</div>}
      </div>
    </div>
  );
};

const AgentAccessDetail = ({ agent, onBack }) => {
  const [grants, setGrants] = React.useState(() =>
    (WF_AGENT_GRANTS[agent.name] || []).map((g) => ({ email: g.email, access: !!g.access }))
  );
  const [addOpen, setAddOpen] = React.useState(false);

  const update = (email, access) => setGrants((gs) => gs.map((g) => g.email === email ? { ...g, access } : g));
  const remove = (email) => setGrants((gs) => gs.filter((g) => g.email !== email));
  const add = (email) => { setGrants((gs) => [...gs, { email, access: true }]); setAddOpen(false); };

  const candidates = WF_USERS.filter((u) => !grants.some((g) => g.email === u.email));
  const withAccess = grants.filter((g) => g.access).length;

  return (
    <>
      <div className="wd-page-header">
        <div className="wd-breadcrumb">
          <button className="icon-btn" onClick={onBack} title="Back">
            <Icon name="arrow_back" size={20} />
          </button>
          <a className="wd-crumb-parent" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Agent Studio</a>
          <span className="wd-crumb-sep">/</span>
          <span className="wd-crumb-current">{agent.name}</span>
        </div>
      </div>

      <div className="scroll">
        <div className="page-body reg-page">
          <div className="ra-head">
            <div className="ra-head-icon"><Icon name="graph_3" size={24} /></div>
            <div className="ra-head-text">
              <h1 className="ra-title">{agent.name}</h1>
              <div className="ra-meta">
                <span>{agent.status}</span>
                <span className="ra-dot">·</span>
                <span>Created by {agent.createdBy}</span>
                <span className="ra-dot">·</span>
                <span>Updated {agent.updated}</span>
              </div>
            </div>
          </div>

          <section className="ra-section">
            <div className="ra-section-head">
              <div>
                <h2 className="ra-section-title">Access</h2>
                <p className="ra-section-desc">Grant specific users access to this agent, letting them view its
                  configuration and run it. Access is scoped to this agent only.
                </p>
              </div>
              <div className="ra-add-wrap">
                <Button variant="primary" icon="person_add" size="sm" onClick={() => setAddOpen((o) => !o)}>
                  Add users
                </Button>
                {addOpen &&
                  <WFAddUserMenu candidates={candidates} onAdd={add} onClose={() => setAddOpen(false)} />
                }
              </div>
            </div>

            <div className="ra-summary">
              <span><strong>{withAccess}</strong> {withAccess === 1 ? "user has" : "users have"} access</span>
            </div>

            <div className="table-wrap">
              <table className="opq-table wf-table ra-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th className="ra-col-toggle">Access</th>
                    <th className="actions-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g) => {
                    const u = wfUserByEmail(g.email);
                    if (!u) return null;
                    return (
                      <tr key={g.email}>
                        <td>
                          <div className="member-cell">
                            <span className="member-avatar">{wfInitialsOf(u.name)}</span>
                            <div>
                              <div className="member-name">{u.name}</div>
                              <div className="member-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ra-col-toggle">
                          <WFAccessToggle on={g.access} onChange={(v) => update(g.email, v)} />
                        </td>
                        <td className="actions-col">
                          <button className="icon-btn" title="Remove access" onClick={() => remove(g.email)}>
                            <Icon name="close" size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {grants.length === 0 &&
                    <tr>
                      <td colSpan={3} className="ra-empty">
                        <Icon name="lock_person" size={28} />
                        <div className="ra-empty-title">No users have access yet</div>
                        <div className="ra-empty-body">Add users to grant access to this agent.</div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

const WF_STATUS_COLORS = {
  "Deployed": "var(--opq-emerald-400)",
  "Draft":    "var(--opq-ink-400)",
};

const WFStatusCell = ({ status }) => (
  <span className="status-cell">
    <span className="status-dot" style={{ background: WF_STATUS_COLORS[status] || "var(--opq-ink-400)" }} />
    <span>{status}</span>
  </span>
);

const trustChip = (trust) => {
  if (!trust) return <span className="wf-trust-none">—</span>;
  if (trust === "Verified") return <Chip variant="success-out">VERIFIED</Chip>;
  if (trust === "Failed")   return <Chip variant="error">FAILED</Chip>;
  if (trust === "At risk")  return <Chip variant="warn">AT RISK</Chip>;
  if (trust === "Pending")  return <Chip variant="neutral">PENDING</Chip>;
  return <Chip variant="neutral">{trust}</Chip>;
};

// SortHeader / Pagination / StatusCell live here and are shared via window.
const SortHeader = ({ label, field, sort, onSort, last }) => {
  const active = sort.field === field;
  const dirIcon = active && sort.dir === "desc" ? "arrow_downward" : "arrow_upward";
  return (
    <th className={`sortable${last ? " last" : ""}`} onClick={() => onSort(field)}>
      <span className="th-inner">
        <span>{label}</span>
        <span className={`sort-ind material-symbols-outlined${active ? " active" : ""}`}>{dirIcon}</span>
      </span>
    </th>
  );
};

const Pagination = ({ page, pageCount, total, rangeFrom, rangeTo, onChange }) => (
  <div className="pagination">
    <div className="pg-right">
      <span className="pg-label">Rows per page:</span>
      <button className="rows-select" type="button">
        <span>10</span>
        <Icon name="arrow_drop_down" size={18} />
      </button>
      <span className="pg-range">{rangeFrom}-{rangeTo} of {total}</span>
      <div className="pg-arrows">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} title="Previous">
          <Icon name="chevron_left" size={18} />
        </button>
        <button className="page-btn" disabled={page === pageCount} onClick={() => onChange(page + 1)} title="Next">
          <Icon name="chevron_right" size={18} />
        </button>
      </div>
    </div>
  </div>
);

// Legacy export kept for any other importer.
const StatusCell = WFStatusCell;

// ---------------- Workflows tab (body only; shell comes from AgentStudioHome) ----------------
const WorkflowsTab = ({ isMember, isAdmin, onOpenAgent }) => {
  const scoped = React.useMemo(
    () => (isMember ? WORKFLOWS.filter(w => w.member) : WORKFLOWS),
    [isMember]
  );

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState({ field: null, dir: "asc" });
  const [query, setQuery] = React.useState("");
  const [openMenu, setOpenMenu] = React.useState(null);

  React.useEffect(() => {
    if (openMenu === null) return;
    const onDoc = () => setOpenMenu(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openMenu]);

  const onSort = (field) => {
    setSort((s) => s.field === field
      ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
      : { field, dir: "asc" });
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scoped.filter(w => {
      if (!q) return true;
      return (
        w.name.toLowerCase().includes(q) ||
        w.createdBy.toLowerCase().includes(q) ||
        w.status.toLowerCase().includes(q) ||
        (w.trust || "").toLowerCase().includes(q)
      );
    });
    if (sort.field) {
      const dir = sort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = a[sort.field] || "";
        const bv = b[sort.field] || "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      });
    }
    return list;
  }, [query, sort, scoped]);

  const counts = React.useMemo(() => {
    let deployed = 0, draft = 0;
    scoped.forEach(w => {
      if (w.status === "Deployed") deployed++;
      if (w.status === "Draft") draft++;
    });
    return { deployed, draft };
  }, [scoped]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(startIdx, startIdx + ROWS_PER_PAGE);
  const rangeFrom = total === 0 ? 0 : startIdx + 1;
  const rangeTo = Math.min(startIdx + ROWS_PER_PAGE, total);

  // First-run empty state (no accessible workflows). Members get the admin
  // directory with mailto links (brief: surface Owners + Global Admins).
  if (scoped.length === 0) {
    return (
      <div className="wf-empty">
        <div className="wf-empty-icon"><Icon name="graph_3" size={32} /></div>
        <div className="wf-empty-title">No workflows yet</div>
        <div className="wf-empty-body">
          {isMember
            ? "Build your first workflow using the built-in nodes, or ask a Global Admin to grant access to registered integrations."
            : "Build your first workflow using the built-in nodes, or register your own integrations in Registry."}
        </div>
        <Button variant="primary" size="sm" onClick={() => { window.location.href = "AgentStudio.html?new=1"; }}>New workflow</Button>
        {isMember && (
          <div className="wf-admin-dir">
            <div className="wf-admin-dir-label">Your organization’s admins</div>
            {wfAdminDirectory().map((a) => (
              <a key={a.email} className="wf-admin-row" href={`mailto:${a.email}`}>
                <span className="member-avatar">{wfInitialsOf(a.name)}</span>
                <span className="wf-admin-id">
                  <span className="member-name">{a.name}</span>
                  <span className="member-email">{a.email}</span>
                </span>
                <Chip variant={opqRoleChip(a.role)}>{a.role}</Chip>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="metric-row" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="card metric-tile">
          <div className="val">{counts.deployed}</div>
          <div className="lbl">
            <span className="status-dot" style={{ background: "var(--opq-emerald-400)" }} />
            <span>Deployed</span>
          </div>
        </div>
        <div className="card metric-tile">
          <div className="val">{counts.draft}</div>
          <div className="lbl">
            <span className="status-dot" style={{ background: "var(--opq-ink-400)" }} />
            <span>Draft</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <label className="search-field">
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <Icon name="search" size={18} />
        </label>
        <div className="spacer" />
        <Button variant="primary" icon={null} size="sm" onClick={() => { window.location.href = "AgentStudio.html?new=1"; }}>New workflow</Button>
      </div>

      <div className="table-wrap">
        <table className="opq-table wf-table">
          <thead>
            <tr>
              <SortHeader label="Name"         field="name"      sort={sort} onSort={onSort} />
              <SortHeader label="Status"       field="status"    sort={sort} onSort={onSort} />
              <SortHeader label="Created by"   field="createdBy" sort={sort} onSort={onSort} />
              <th><span className="th-inner"><span>Access</span></span></th>
              <SortHeader label="Last updated" field="updated"   sort={sort} onSort={onSort} last />
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.name}>
                <td>
                  <a className="link" href="AgentStudio.html">{w.name}</a>
                </td>
                <td><WFStatusCell status={w.status} /></td>
                <td>{w.createdBy}</td>
                <td>
                  <span className="reg-access-count" title={`${wfAccessCountFor(w.name)} user${wfAccessCountFor(w.name) === 1 ? "" : "s"} with access`}>
                    <Icon name="group" size={16} />
                    <span>{wfAccessCountFor(w.name)}</span>
                  </span>
                </td>
                <td>{w.updated}</td>
                <td className="actions-col" style={{ position: "relative" }}>
                  <button className="icon-btn" title="More" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === w.name ? null : w.name); }}>
                    <Icon name="more_vert" size={18} />
                  </button>
                  {openMenu === w.name &&
                    <div className="reg-row-menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setOpenMenu(null)}><Icon name="edit" size={16} /><span>Edit workflow</span></button>
                      <button className="reg-row-menu-danger" onClick={() => setOpenMenu(null)}><Icon name="delete" size={16} /><span>Delete</span></button>
                    </div>
                  }
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "48px 12px", color: "var(--opq-ink-400)" }}>
                  No workflows match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={total}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          onChange={(p) => setPage(Math.max(1, Math.min(pageCount, p)))}
        />
      </div>
    </>
  );
};

// ---------------- Integrations tab (consumption catalog) ----------------
const StudioTypeCell = ({ type }) => (
  <span className="type-cell">
    <Icon name={TYPE_ICONS_STUDIO[type] || "category"} size={18} />
    <span>{type}</span>
  </span>
);

const StudioIntegrationsTab = ({ isMember, isAdmin }) => {
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("All types");
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const memberUser = WF_USERS.find((u) => u.name === OPQ_PERSONA.member.name);
  const base = isAdmin ? STUDIO_INTEGRATIONS : studioIntegrationsFor(memberUser ? memberUser.email : "");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((r) => {
      if (typeFilter !== "All types" && r.type !== typeFilter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.source.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    });
  }, [query, typeFilter, base]);

  return (
    <>
      <p className="reg-tab-helper">
        {isAdmin
          ? (opqIsMulti()
              ? `Integrations bound to ${opqGetWorkspace()} are available here as nodes. Register a new integration to add it to this workspace — it’s also saved back to Registry. Bind existing integrations from Registry.`
              : "Every integration registered to your organization is available here as a node. Register a new integration to add it to the pool — it’s saved back to Registry and immediately usable in Studio.")
          : "Integrations you can use as nodes in your agents. Ask a Global Admin if you need access to something that isn’t listed."}
      </p>

      <div className="filter-bar reg-filter-bar">
        <label className="search-field">
          <input placeholder="Search integrations..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Icon name="search" size={18} />
        </label>
        <div className="type-filters">
          {TYPE_FILTERS_STUDIO.map((t) => (
            <button key={t} className={`type-filter${typeFilter === t ? " active" : ""}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="spacer" />
        {isAdmin && <Button variant="primary" icon="add" size="sm" onClick={() => setRegisterOpen(true)}>Register integration</Button>}
      </div>

      <div className="table-wrap">
        <table className="opq-table wf-table reg-table">
          <thead>
            <tr>
              <th><span className="th-inner"><span>Name</span></span></th>
              <th><span className="th-inner"><span>Type</span></span></th>
              <th><span className="th-inner"><span>Source</span></span></th>
              <th className="last"><span className="th-inner"><span>Last updated</span></span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.name}>
                <td><span className="reg-name">{r.name}</span></td>
                <td><StudioTypeCell type={r.type} /></td>
                <td>{r.source}</td>
                <td className="reg-muted">{r.updated}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "48px 12px", color: "var(--opq-ink-400)" }}>
                  {isMember ? "You don’t have access to any integrations yet." : "No integrations match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && typeof RegisterIntegrationModal !== "undefined" &&
        <RegisterIntegrationModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onComplete={(r) => setToast(r)}
        />
      }
      {toast &&
        <div className="rr-toast">
          <span className="rr-toast-dot" />
          <span><strong>{toast.name}</strong> registered as {toast.type} · {opqIsMulti() ? `bound to ${opqGetWorkspace()}` : "available org-wide"}</span>
          <button className="rr-toast-close" onClick={() => setToast(null)}>
            <Icon name="close" size={16} />
          </button>
        </div>
      }
    </>
  );
};

// ---------------- Agent Studio home (tabs: Workflows + Integrations) ----------------

// Workspace select — lives in the Agent Studio page header (multi-workspace
// mode). Replaces the old left-nav workspace picker. Clicking "HR Internal"
// opens the shared WorkspaceMenu dropdown.
const WorkspaceSelect = () => {
  const [open, setOpen] = React.useState(false);
  const isAdmin = opqIsAdmin(opqGetRole());
  const activeWs = OPQ_WORKSPACES.find((w) => w.name === opqGetWorkspace()) || OPQ_WORKSPACES[2];
  return (
    <div className="hdr-ws">
      <button
        className={`hdr-ws-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Switch workspace"
      >
        <span className="ws-initials">{activeWs.initials}</span>
        <span className="hdr-ws-name">{activeWs.name}</span>
        <Icon name="unfold_more" size={16} />
      </button>
      {open && (
        <WorkspaceMenu
          current={activeWs.name}
          isAdmin={isAdmin}
          onPick={(w) => { opqSetWorkspace(w.name); location.reload(); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

const AgentStudioHome = () => {
  const role = opqGetRole();
  const isMember = role === "member";
  const isAdmin = opqIsAdmin(role);
  const [tab, setTab] = React.useState("Workflows");
  const [openAgent, setOpenAgent] = React.useState(null);

  // Drill-in: per-agent access management replaces the whole shell.
  if (openAgent) {
    return <AgentAccessDetail agent={openAgent} onBack={() => setOpenAgent(null)} />;
  }

  return (
    <>
      <PageHeader
        title="Agent Studio"
        chip={opqIsMulti() ? <WorkspaceSelect /> : undefined}
        tabs={["Workflows", "Integrations"]}
        activeTab={tab}
        onTab={setTab}
      />
      <div className="scroll">
        <div className={tab === "Integrations" ? "page-body reg-page" : "page-body"}>
          {tab === "Workflows"
            ? <WorkflowsTab isMember={isMember} isAdmin={isAdmin} onOpenAgent={setOpenAgent} />
            : <StudioIntegrationsTab isMember={isMember} isAdmin={isAdmin} />}
        </div>
      </div>
    </>
  );
};

// Back-compat alias so older mounts still resolve.
const WorkflowsList = AgentStudioHome;

Object.assign(window, { AgentStudioHome, WorkflowsTab, StudioIntegrationsTab, WorkflowsList, SortHeader, Pagination, StatusCell });
