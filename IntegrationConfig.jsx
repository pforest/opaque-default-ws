// Workflow builder — drag an integration onto the canvas, then configure it:
// tool vs. non-tool (pipeline) mode, the subset of pre-allowed operations to
// enable, and additional per-mode configuration. Operations are constrained to
// what was approved for the integration in Registry — the builder can never
// exceed that scope.
//
// Loaded BEFORE AgentStudio.jsx so its exports (BUILDER_INTEGRATIONS,
// ConfigureIntegrationModal, IntegrationNode) are available when the canvas
// builds NODE_RENDER. All top-level names are IC-prefixed to avoid colliding
// with AgentStudio.jsx in the shared global scope.

// Registered integrations available as builder nodes. Each carries the
// operations Registry approved for it (write flag drives the Read/Write badge).
const BUILDER_INTEGRATIONS = [
  {
    id: "salesforce_crm",
    name: "Salesforce CRM",
    source: "Salesforce",
    family: "Databases",
    icon: "cloud",
    defaultMode: "pipeline",
    operations: [
      { id: "read", label: "Read records", write: false },
      { id: "create", label: "Create records", write: true },
      { id: "update", label: "Update records", write: true },
    ],
  },
  {
    id: "hr_policies",
    name: "HR Policies Corpus",
    source: "PostgreSQL",
    family: "Databases",
    icon: "table_view",
    defaultMode: "pipeline",
    operations: [
      { id: "select", label: "SELECT", write: false },
    ],
  },
  {
    id: "confluence",
    name: "Confluence Wiki",
    source: "Atlassian",
    family: "File storage",
    icon: "description",
    defaultMode: "pipeline",
    operations: [
      { id: "read", label: "Read pages", write: false },
    ],
  },
  {
    id: "web_search",
    name: "Web Search",
    source: "Brave",
    family: "APIs & web",
    icon: "language",
    defaultMode: "tool",
    operations: [
      { id: "search", label: "Search", write: false },
    ],
  },
  {
    id: "sql_query",
    name: "SQL Query Tool",
    source: "Finance Ledger",
    family: "Databases",
    icon: "data_object",
    defaultMode: "tool",
    operations: [
      { id: "select", label: "SELECT", write: false },
      { id: "insert", label: "INSERT", write: true },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    source: "Slack",
    family: "Messaging",
    icon: "forum",
    defaultMode: "tool",
    operations: [
      { id: "read", label: "Read messages", write: false },
      { id: "post", label: "Post messages", write: true },
    ],
  },
  {
    id: "data_lake",
    name: "Data Lake — Raw",
    source: "Amazon S3",
    family: "File storage",
    icon: "storage",
    defaultMode: "pipeline",
    operations: [
      { id: "read", label: "Read files", write: false },
      { id: "list", label: "List", write: false },
      { id: "write", label: "Write files", write: true },
    ],
  },
  {
    id: "orders_bus",
    name: "Orders Event Bus",
    source: "Apache Kafka",
    family: "Messaging",
    icon: "hub",
    defaultMode: "pipeline",
    operations: [
      { id: "subscribe", label: "Subscribe", write: false },
      { id: "publish", label: "Publish", write: true },
    ],
  },
  {
    id: "recon_jobs",
    name: "Reconciliation Jobs",
    source: "Temporal",
    family: "Execution",
    icon: "rocket_launch",
    defaultMode: "tool",
    operations: [
      { id: "trigger", label: "Trigger", write: true },
      { id: "cancel", label: "Cancel", write: true },
    ],
  },
  {
    id: "support_mcp",
    name: "Support Tools MCP",
    source: "MCP Server",
    family: "MCP servers",
    icon: "extension",
    defaultMode: "tool",
    operations: [
      { id: "list", label: "List tools", write: false },
      { id: "invoke", label: "Invoke tools", write: true },
    ],
  },
];

const IC_slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

// ---- shared mini controls (IC-prefixed to avoid scope collisions) ----

const ICToggle = ({ on, onChange }) => (
  <button
    type="button"
    className={`as-mini-toggle${on ? " on" : ""}`}
    onClick={() => onChange && onChange(!on)}
    aria-pressed={on}
  >
    <span className="knob" />
  </button>
);

const ICField = ({ label, value, mono }) => (
  <div>
    <div className="as-field-label">{label}</div>
    <div className={`as-field-value${mono ? " mono" : ""}`}>{value}</div>
  </div>
);

// ---- Configure-integration modal (opened on drop) ----

const IC_MODES = [
  { key: "tool", title: "Tool mode", icon: "build", desc: "Exposed to the agent as a callable tool." },
  { key: "pipeline", title: "Non-tool", icon: "account_tree", desc: "Wired directly into the graph via edges." },
];

const ConfigureIntegrationModal = ({ integration, onClose, onAdd }) => {
  const [mode, setMode] = React.useState(integration ? (integration.defaultMode || "tool") : "tool");
  const [ops, setOps] = React.useState({});
  const [cfg, setCfg] = React.useState({});
  const [guardrails, setGuardrails] = React.useState(false);

  React.useEffect(() => {
    if (!integration) return;
    // Default: enable every pre-allowed operation.
    const o = {};
    integration.operations.forEach((op) => { o[op.id] = true; });
    setOps(o);
    const slug = IC_slug(integration.name);
    setCfg({
      toolName: slug,
      toolDescription: `Access ${integration.name} via ${integration.source}.`,
      timeout: "15000",
      outputVar: `{{${slug}:output}}`,
      maxResults: "25",
    });
    setMode(integration.defaultMode || "tool");
    setGuardrails(false);
  }, [integration]);

  React.useEffect(() => {
    if (!integration) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [integration, onClose]);

  if (!integration) return null;

  const setCfgField = (id, v) => setCfg((s) => ({ ...s, [id]: v }));
  const selectedCount = Object.values(ops).filter(Boolean).length;
  const canAdd = selectedCount > 0;

  const add = () => {
    if (!canAdd) return;
    const enabled = integration.operations.filter((op) => ops[op.id]);
    onAdd({
      integrationId: integration.id,
      title: integration.name,
      source: integration.source,
      type: integration.family,
      icon: integration.icon,
      mode,
      operations: enabled.map((op) => ({ label: op.label, write: op.write })),
      config: { ...cfg },
      guardrails,
    });
  };

  return (
    <div className="rr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rr-modal ic-modal" role="dialog" aria-modal="true">
        <div className="rr-modal-head">
          <div className="rr-modal-title-row">
            <div className="ic-modal-id">
              <span className="rr-connector-icon tone-info"><Icon name={integration.icon} size={18} /></span>
              <div>
                <h2 className="rr-modal-title">Configure {integration.name}</h2>
                <div className="ic-modal-sub">{integration.family} · {integration.source}</div>
              </div>
            </div>
            <button className="rr-close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        <div className="rr-modal-body">
          {/* Mode */}
          <div className="ic-group-label">Mode</div>
          <div className="rr-access-seg ic-mode-seg">
            {IC_MODES.map((m) => (
              <button
                key={m.key}
                className={`rr-access-opt${mode === m.key ? " selected" : ""}`}
                onClick={() => setMode(m.key)}
              >
                <Icon name={m.icon} size={18} />
                <span className="rr-access-title">{m.title}</span>
                <span className="rr-access-desc">{m.desc}</span>
              </button>
            ))}
          </div>

          {/* Operations */}
          <div className="ic-group-label">
            Allowed operations
            <span className="ic-group-hint">Limited to operations approved in Registry</span>
          </div>
          <div className="rr-op-list ic-op-list">
            {integration.operations.map((op) => {
              const on = !!ops[op.id];
              return (
                <button
                  key={op.id}
                  className={`rr-op-row${on ? " on" : ""}`}
                  onClick={() => setOps((s) => ({ ...s, [op.id]: !s[op.id] }))}
                >
                  <span className="rr-op-check">
                    <Icon name={on ? "check_box" : "check_box_outline_blank"} size={20} />
                  </span>
                  <span className="rr-op-main">
                    <span className="rr-op-label">
                      {op.label}
                      <span className={`rr-op-badge ${op.write ? "write" : "read"}`}>{op.write ? "Write" : "Read"}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Configuration */}
          <div className="ic-group-label">Configuration</div>
          <div className="rr-form">
            {mode === "tool" ? (
              <>
                <div className="rr-field">
                  <label className="rr-label">Tool name</label>
                  <input className="rr-input" value={cfg.toolName || ""} onChange={(e) => setCfgField("toolName", e.target.value)} />
                </div>
                <div className="rr-field">
                  <label className="rr-label">Tool description</label>
                  <textarea className="rr-input" rows={2} value={cfg.toolDescription || ""} onChange={(e) => setCfgField("toolDescription", e.target.value)} />
                  <div className="rr-help">Shown to the agent when deciding whether to call this tool.</div>
                </div>
                <div className="rr-field">
                  <label className="rr-label">Call timeout (ms)</label>
                  <input className="rr-input" value={cfg.timeout || ""} onChange={(e) => setCfgField("timeout", e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="rr-field">
                  <label className="rr-label">Output variable</label>
                  <input className="rr-input" value={cfg.outputVar || ""} onChange={(e) => setCfgField("outputVar", e.target.value)} />
                  <div className="rr-help">Referenced downstream as a workflow variable.</div>
                </div>
                <div className="rr-field">
                  <label className="rr-label">Max results</label>
                  <input className="rr-input" value={cfg.maxResults || ""} onChange={(e) => setCfgField("maxResults", e.target.value)} />
                </div>
              </>
            )}
            <div className="ic-guard-row">
              <div>
                <div className="rr-label">Guardrails</div>
                <div className="rr-help">Apply org policy checks to this integration's calls.</div>
              </div>
              <ICToggle on={guardrails} onChange={setGuardrails} />
            </div>
          </div>
        </div>

        <div className="rr-modal-foot">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <div className="rr-foot-spacer" />
          <button
            className={`btn btn-primary btn-sm${canAdd ? "" : " is-disabled"}`}
            onClick={canAdd ? add : undefined}
            disabled={!canAdd}
          >
            Add to canvas
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Integration node renderer (configured node on the canvas) ----

const IntegrationNode = ({ node }) => {
  const cfg = node.config || {};
  const isTool = node.mode === "tool";
  return (
    <>
      <div className="as-node-badge as-badge--attested"><Icon name="lock" size={12} />ATTESTED CONFIG</div>
      <div className="as-node-head">
        <span className="as-node-icon"><Icon name={node.icon || "extension"} size={18} /></span>
        <span className="as-node-title">{node.title}</span>
        <span className="as-node-expand"><Icon name="open_in_full" size={15} /></span>
      </div>
      <div className="as-node-body">
        <div className="as-toolmode">
          <ICToggle on={isTool} />
          <span className="as-toolmode-label">{isTool ? "Tool mode" : "Non-tool · pipeline"}</span>
        </div>
        <div>
          <div className="as-field-label">Operations</div>
          <div className="as-op-chips">
            {(node.operations || []).map((op) => (
              <span key={op.label} className={`as-op-chip ${op.write ? "write" : "read"}`}>{op.label}</span>
            ))}
          </div>
        </div>
        {isTool ? (
          <>
            <ICField label="Tool name" value={cfg.toolName} mono />
            <ICField label="Call timeout (ms)" value={cfg.timeout} />
          </>
        ) : (
          <>
            <ICField label="Output variable" value={cfg.outputVar} mono />
            <ICField label="Max results" value={cfg.maxResults} />
          </>
        )}
        <div className="as-toolmode">
          <ICToggle on={node.guardrails} />
          <span className="as-toolmode-label">Guardrails · {node.guardrails ? "On" : "Off"}</span>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { BUILDER_INTEGRATIONS, ConfigureIntegrationModal, IntegrationNode });
