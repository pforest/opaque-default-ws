// Registry — org-level home for every registered item: containers, data
// connectors, agent tools, and models — in a single unified list.

const ROWS_PER_PAGE_REG = 10;

// ---------------- Workspace permissions cell ----------------

const WorkspacePerms = ({ workspaces }) => {
  if (!workspaces || workspaces.length === 0) {
    return <span className="reg-unbound">No workspaces · <a className="link" href="#" onClick={(e) => e.preventDefault()}>Permission</a></span>;
  }
  if (workspaces.length === 1) {
    return <span className="reg-ws">{workspaces[0]}</span>;
  }
  return (
    <span className="reg-ws-multi">
      <span className="reg-ws">{workspaces[0]}</span>
      <span className="reg-ws-more">+{workspaces.length - 1}</span>
    </span>);

};

// Containers — registered via the CLI. They live in the same unified list as
// integrations, distinguished by type "Containers".
const REG_CONTAINERS = [
{ name: "HR Assist",  type: "Containers", registeredBy: "Annemarie Selaya", updated: "14 Apr 2026", workspaces: ["HR Internal"] },
{ name: "fin-rag",    type: "Containers", registeredBy: "Evan McMillon",     updated: "12 Feb 2026", workspaces: ["Finance Department"] },
{ name: "fin-rag-v3", type: "Containers", registeredBy: "Deborah Mercy",     updated: "24 Jan 2026", workspaces: [] },
{ name: "HR RAG v1",  type: "Containers", registeredBy: "Janice Johnson",    updated: "24 Jan 2026", workspaces: ["HR Internal"] }];


// ---------------- Integrations tab (org-level) ----------------

const REG_INTEGRATIONS = [
{ name: "HR Policies Corpus", type: "Databases", registeredBy: "Annemarie Selaya", updated: "18 Apr 2026" },
{ name: "Salesforce CRM", type: "Databases", registeredBy: "Deborah Mercy", updated: "12 Apr 2026" },
{ name: "SQL Query Tool", type: "Databases", registeredBy: "Jordan Bellamy", updated: "07 Apr 2026" },
{ name: "Confluence Wiki", type: "File storage", registeredBy: "Priya Manikandan", updated: "09 Apr 2026" },
{ name: "Data Lake — Raw", type: "File storage", registeredBy: "Maya Ramirez", updated: "15 Apr 2026" },
{ name: "Orders Event Bus", type: "Messaging", registeredBy: "Jordan Bellamy", updated: "16 Apr 2026" },
{ name: "Reconciliation Jobs", type: "Execution", registeredBy: "Devon Oduya", updated: "13 Apr 2026" },
{ name: "Code Interpreter", type: "Execution", registeredBy: "Devon Oduya", updated: "26 Mar 2026" },
{ name: "Web Search", type: "APIs & web", registeredBy: "Platform", updated: "11 Apr 2026" },
{ name: "Support Tools MCP", type: "MCP servers", registeredBy: "Kiran Patel", updated: "10 Apr 2026" },
{ name: "Claude Sonnet 4.5", type: "Models", registeredBy: "Platform", updated: "14 Apr 2026" },
{ name: "Claude Haiku 4.5", type: "Models", registeredBy: "Platform", updated: "04 Apr 2026" },
{ name: "Claude Opus 4", type: "Models", registeredBy: "Platform", updated: "14 Mar 2026" }];


const TYPE_FILTERS_REG = ["All types", "Containers", "Models", "Databases", "File storage", "Messaging", "Execution", "APIs & web", "MCP servers"];
const TYPE_ICONS_REG = {
  "Containers": "deployed_code",
  "Models": "network_intel_node",
  "Databases": "database",
  "File storage": "folder_open",
  "Messaging": "forum",
  "Execution": "bolt",
  "APIs & web": "language",
  "MCP servers": "extension"
};

const RegTypeCell = ({ type }) =>
<span className="type-cell">
    <Icon name={TYPE_ICONS_REG[type] || "category"} size={18} />
    <span>{type}</span>
  </span>;


const BoundCell = ({ boundTo, onBind }) => {
  if (!boundTo || boundTo.length === 0) {
    return <span className="reg-unbound">Unbound · <a className="link" href="#" onClick={(e) => {e.preventDefault();onBind && onBind();}}>Bind</a></span>;
  }
  if (boundTo.length === 1) return <span className="reg-ws">{boundTo[0]}</span>;
  return (
    <span className="reg-ws-multi">
      <span className="reg-ws">{boundTo[0]}</span>
      <span className="reg-ws-more">+{boundTo.length - 1}</span>
    </span>);

};

// ---------------- Integration access (drill-in) ----------------

const REG_USERS = [
{ name: "Annemarie Selaya", email: "annemarie@opaque.co", role: "Owner" },
{ name: "Evan McMillon", email: "evan@opaque.co", role: "Global Admin" },
{ name: "Deborah Mercy", email: "deborah@opaque.co", role: "Global Admin" },
{ name: "Janice Johnson", email: "janice@opaque.co", role: "Member" },
{ name: "Priya Manikandan", email: "priya@opaque.co", role: "Member" },
{ name: "Jordan Bellamy", email: "jordan@opaque.co", role: "Member" },
{ name: "Maya Ramirez", email: "maya@opaque.co", role: "Member" },
{ name: "Noah Westergaard", email: "noah@opaque.co", role: "Member" },
{ name: "Devon Oduya", email: "devon@opaque.co", role: "Member" },
{ name: "Kiran Patel", email: "kiran@opaque.co", role: "Member" },
{ name: "Isabel Cortez", email: "isabel@opaque.co", role: "Member" },
{ name: "Ben Tatsumi", email: "ben@opaque.co", role: "Member" }];


// Seed grants per integration so the surface feels populated. Keyed by name;
// anything not listed starts empty.
const DEFAULT_GRANTS = {
  "HR Policies Corpus": [
  { email: "annemarie@opaque.co", view: true, use: true },
  { email: "priya@opaque.co", view: true, use: true },
  { email: "jordan@opaque.co", view: true, use: false }],

  "Salesforce CRM": [
  { email: "deborah@opaque.co", view: true, use: true },
  { email: "maya@opaque.co", view: true, use: true }],

  "Claude Sonnet 4.5": [
  { email: "annemarie@opaque.co", view: true, use: true },
  { email: "evan@opaque.co", view: true, use: true },
  { email: "jordan@opaque.co", view: true, use: true },
  { email: "maya@opaque.co", view: true, use: false }]

};

const initialsOf = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const userByEmail = (email) => REG_USERS.find((u) => u.email === email);

// Count of users with access (view or use) to a given integration.
const accessCountFor = (name) =>
  (DEFAULT_GRANTS[name] || []).filter((g) => g.view || g.use).length;

const AccessToggle = ({ on, onChange, disabled }) =>
<button
  type="button"
  className={`opq-toggle${on ? " on" : ""}${disabled ? " disabled" : ""}`}
  onClick={() => !disabled && onChange(!on)}
  aria-pressed={on}
  disabled={disabled}>
  
    <span className="opq-toggle-knob" />
  </button>;


const AddUserMenu = ({ candidates, onAdd, onClose }) => {
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {if (ref.current && !ref.current.contains(e.target)) onClose();};
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {document.removeEventListener("mousedown", onDoc);document.removeEventListener("keydown", onKey);};
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
        {filtered.map((u) =>
        <button key={u.email} className="ra-add-item" onClick={() => onAdd(u.email)}>
            <span className="member-avatar">{initialsOf(u.name)}</span>
            <span className="ra-add-text">
              <span className="member-name">{u.name}</span>
              <span className="member-email">{u.email}</span>
            </span>
            <Icon name="add" size={18} />
          </button>
        )}
        {filtered.length === 0 && <div className="ra-add-empty">No users to add</div>}
      </div>
    </div>);

};

const IntegrationDetail = ({ integration, onBack }) => {
  const [grants, setGrants] = React.useState(() =>
  (DEFAULT_GRANTS[integration.name] || []).map((g) => ({ email: g.email, access: !!(g.view || g.use) }))
  );
  const [addOpen, setAddOpen] = React.useState(false);

  const update = (email, access) => setGrants((gs) => gs.map((g) =>
  g.email === email ? { ...g, access } : g
  ));
  const remove = (email) => setGrants((gs) => gs.filter((g) => g.email !== email));
  const add = (email) => {setGrants((gs) => [...gs, { email, access: true }]);setAddOpen(false);};

  const candidates = REG_USERS.filter((u) => !grants.some((g) => g.email === u.email));
  const withAccess = grants.filter((g) => g.access).length;

  return (
    <>
      <div className="wd-page-header">
        <div className="wd-breadcrumb">
          <button className="icon-btn" onClick={onBack} title="Back">
            <Icon name="arrow_back" size={20} />
          </button>
          <a className="wd-crumb-parent" href="#" onClick={(e) => {e.preventDefault();onBack();}}>Registry</a>
          <span className="wd-crumb-sep">/</span>
          <span className="wd-crumb-mid">Integrations</span>
          <span className="wd-crumb-sep">/</span>
          <span className="wd-crumb-current">{integration.name}</span>
        </div>
      </div>

      <div className="scroll">
        <div className="page-body reg-page">
          <div className="ra-head">
            <div className="ra-head-icon"><Icon name={TYPE_ICONS_REG[integration.type] || "category"} size={24} /></div>
            <div className="ra-head-text">
              <h1 className="ra-title">{integration.name}</h1>
              <div className="ra-meta">
                <span>{integration.type}</span>
                <span className="ra-dot">·</span>
                <span>Registered by {integration.registeredBy}</span>
                <span className="ra-dot">·</span>
                <span>Updated {integration.updated}</span>
              </div>
            </div>
          </div>

          <section className="ra-section">
            <div className="ra-section-head">
              <div>
                <h2 className="ra-section-title">Access</h2>
                <p className="ra-section-desc">Grant specific users access to this integration,  letting them use it as a node in their agents.


                </p>
              </div>
              <div className="ra-add-wrap">
                <Button variant="primary" icon="person_add" size="sm" onClick={() => setAddOpen((o) => !o)}>
                  Add users
                </Button>
                {addOpen &&
                <AddUserMenu candidates={candidates} onAdd={add} onClose={() => setAddOpen(false)} />
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
                    const u = userByEmail(g.email);
                    if (!u) return null;
                    return (
                      <tr key={g.email}>
                        <td>
                          <div className="member-cell">
                            <span className="member-avatar">{initialsOf(u.name)}</span>
                            <div>
                              <div className="member-name">{u.name}</div>
                              <div className="member-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ra-col-toggle">
                          <AccessToggle on={g.access} onChange={(v) => update(g.email, v)} />
                        </td>
                        <td className="actions-col">
                          <button className="icon-btn" title="Remove access" onClick={() => remove(g.email)}>
                            <Icon name="close" size={18} />
                          </button>
                        </td>
                      </tr>);

                  })}
                  {grants.length === 0 &&
                  <tr>
                      <td colSpan={3} className="ra-empty">
                        <Icon name="lock_person" size={28} />
                        <div className="ra-empty-title">No users have access yet</div>
                        <div className="ra-empty-body">Add users to grant access to this integration.</div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>);

};


// Workspace bindings for org integrations (multi-workspace mode only). In
// single-workspace mode every integration is auto-bound to the default workspace,
// so this column is hidden. Platform/foundation integrations bind to all.
const INTEGRATION_WS = {
  "HR Policies Corpus": ["HR Internal"],
  "Salesforce CRM":     ["Finance Department", "Sales & Marketing"],
  "Confluence Wiki":    ["HR Internal", "Sales & Marketing"],
  "Web Search":         ["Opaque Systems", "Finance Department", "HR Internal", "Sales & Marketing"],
  "SQL Query Tool":     ["Finance Department"],
  "Code Interpreter":   [],
  "Claude Sonnet 4.5":  ["Opaque Systems", "Finance Department", "HR Internal", "Sales & Marketing"],
  "Claude Haiku 4.5":   ["Opaque Systems", "Finance Department", "HR Internal", "Sales & Marketing"],
  "Claude Opus 4":      ["Finance Department", "HR Internal"],
};

const IntegrationsTab = ({ onOpen }) => {
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState({ field: null, dir: "asc" });
  const multi = opqIsMulti();
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("All types");
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    if (openMenu === null) return;
    const onDoc = () => setOpenMenu(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openMenu]);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const onSort = (field) => {
    setSort((s) => s.field === field ?
    { field, dir: s.dir === "asc" ? "desc" : "asc" } :
    { field, dir: "asc" });
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...REG_INTEGRATIONS, ...REG_CONTAINERS].filter((r) => {
      if (typeFilter !== "All types" && r.type !== typeFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.registeredBy.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q));

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
  }, [query, sort, typeFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / ROWS_PER_PAGE_REG));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * ROWS_PER_PAGE_REG;
  const rows = filtered.slice(startIdx, startIdx + ROWS_PER_PAGE_REG);
  const rangeFrom = total === 0 ? 0 : startIdx + 1;
  const rangeTo = Math.min(startIdx + ROWS_PER_PAGE_REG, total);

  return (
    <>
      <p className="reg-tab-helper">
        {multi
          ? "Everything registered to your organization — containers, models, and integrations grouped by what they connect to. Containers are registered via the CLI; integrations must be bound to the workspaces where workflows can use them."
          : "Everything registered to your organization — containers, models, and integrations grouped by what they connect to. Containers are registered via the CLI; every integration is available org-wide to any workflow that references it."}
      </p>
      <div className="filter-bar reg-filter-bar">
        <label className="search-field">
          <input
            placeholder="Search integrations..."
            value={query}
            onChange={(e) => {setQuery(e.target.value);setPage(1);}} />
          
          <Icon name="search" size={18} />
        </label>
        <div className="type-filters">
          {TYPE_FILTERS_REG.map((t) =>
          <button
            key={t}
            className={`type-filter${typeFilter === t ? " active" : ""}`}
            onClick={() => {setTypeFilter(t);setPage(1);}}>
            
              {t}
            </button>
          )}
        </div>
        <div className="spacer" />
        <Button variant="primary" icon="add" size="sm" onClick={() => setRegisterOpen(true)}>Register integration</Button>
      </div>

      <div className="table-wrap">
        <table className="opq-table wf-table reg-table">
          <thead>
            <tr>
              <SortHeader label="Name" field="name" sort={sort} onSort={onSort} />
              <SortHeader label="Type" field="type" sort={sort} onSort={onSort} />
              <SortHeader label="Registered by" field="registeredBy" sort={sort} onSort={onSort} />
              {multi && <th><span className="th-inner"><span>Workspaces</span></span></th>}
              <SortHeader label="Last updated" field="updated" sort={sort} onSort={onSort} last />
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
            <tr key={r.name}>
                <td>
                  <span className="reg-name">{r.name}</span>
                </td>
                <td><RegTypeCell type={r.type} /></td>
                <td>{r.registeredBy}</td>
                {multi && <td><WorkspacePerms workspaces={r.workspaces || INTEGRATION_WS[r.name] || []} /></td>}
                <td className="reg-muted">{r.updated}</td>
                <td className="actions-col" style={{ position: "relative" }}>
                  <button className="icon-btn" title="More" onClick={(e) => {e.stopPropagation();setOpenMenu(openMenu === r.name ? null : r.name);}}>
                    <Icon name="more_vert" size={18} />
                  </button>
                  {openMenu === r.name &&
                <div className="reg-row-menu" onClick={(e) => e.stopPropagation()}>
                      {r.type === "Containers" ? (
                        <>
                          <button><Icon name="verified_user" size={16} /><span>View attestation</span></button>
                          <button className="reg-row-menu-danger"><Icon name="delete" size={16} /><span>Unregister</span></button>
                        </>
                      ) : (
                        <>
                          <button><Icon name="edit" size={16} /><span>Edit configuration</span></button>
                          <button className="reg-row-menu-danger"><Icon name="delete" size={16} /><span>Unregister</span></button>
                        </>
                      )}
                    </div>
                }
                </td>
              </tr>
            )}
            {rows.length === 0 &&
            <tr>
                <td colSpan={multi ? 6 : 5} style={{ textAlign: "center", padding: "48px 12px", color: "var(--opq-ink-400)" }}>
                  No integrations match your filters.
                </td>
              </tr>
            }
          </tbody>
        </table>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={total}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          onChange={(p) => setPage(Math.max(1, Math.min(pageCount, p)))} />
        
      </div>

      <RegisterIntegrationModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onComplete={(r) => setToast(r)} />
      
      {toast &&
      <div className="rr-toast">
          <span className="rr-toast-dot" />
          <span><strong>{toast.name}</strong> registered as {toast.type}</span>
          <button className="rr-toast-close" onClick={() => setToast(null)}>
            <Icon name="close" size={16} />
          </button>
        </div>
      }
    </>);

};

// ---------------- Main Registry component ----------------

const Registry = () => {
  const [openIntegration, setOpenIntegration] = React.useState(null);

  // Members have no access to Registry (brief). Nav hides it; guard here too.
  if (!opqIsAdmin()) {
    return <NoAccess title="Registry" area="Registry" />;
  }

  if (openIntegration) {
    return <IntegrationDetail integration={openIntegration} onBack={() => setOpenIntegration(null)} />;
  }

  return (
    <>
      <PageHeader title="Registry" />
      <div className="scroll">
        <div className="page-body reg-page">
          <IntegrationsTab onOpen={setOpenIntegration} />
        </div>
      </div>
    </>);

};

Object.assign(window, { Registry });