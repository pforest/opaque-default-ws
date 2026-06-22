// Create Integration flow — 2-step modal: source → configure.
// You pick an external source to connect to (e.g. Salesforce), then on a single
// configure screen set the credentials saved to the integration and define
// which operations it is allowed to perform (read only, read & write, or custom).

// Source catalog. Each source: id, name, desc, icon (material symbol),
// tone (color accent), category (Registry type label), credential `fields`,
// and the `operations` it supports (each: id, label, desc, write flag).
const RR_SOURCES = [
  {
    id: "salesforce",
    name: "Salesforce",
    desc: "Connect to a Salesforce org to read and write CRM objects.",
    icon: "cloud",
    tone: "info",
    category: "Databases",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "Salesforce — Production" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "instanceUrl", label: "Instance URL", required: true, placeholder: "https://myorg.my.salesforce.com" },
      { id: "clientId", label: "Consumer key", required: true, placeholder: "Connected app consumer key" },
      { id: "clientSecret", label: "Consumer secret", type: "password", required: true, help: "Secret can only be updated by the person who entered it." },
    ],
    operations: [
      { id: "read", label: "Read records", desc: "Query accounts, contacts, opportunities and custom objects.", write: false },
      { id: "create", label: "Create records", desc: "Insert new records into Salesforce objects.", write: true },
      { id: "update", label: "Update records", desc: "Modify existing record fields.", write: true },
      { id: "delete", label: "Delete records", desc: "Remove records from Salesforce.", write: true },
    ],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    desc: "Connect to a PostgreSQL database and run SQL against it.",
    icon: "table_view",
    tone: "info",
    category: "Databases",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "Finance Ledger DB" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "host", label: "Host", required: true },
      { id: "port", label: "Port", placeholder: "5432" },
      { id: "database", label: "Database", required: true },
      { id: "user", label: "Username", required: true },
      { id: "password", label: "Password", type: "password", required: true },
    ],
    operations: [
      { id: "select", label: "SELECT", desc: "Read rows from tables and views.", write: false },
      { id: "insert", label: "INSERT", desc: "Add new rows.", write: true },
      { id: "update", label: "UPDATE", desc: "Modify existing rows.", write: true },
      { id: "delete", label: "DELETE", desc: "Remove rows.", write: true },
    ],
  },
  {
    id: "snowflake",
    name: "Snowflake",
    desc: "Connect to a Snowflake warehouse for analytics queries.",
    icon: "ac_unit",
    tone: "info",
    category: "Databases",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "account", label: "Account identifier", required: true, placeholder: "xy12345.us-east-1" },
      { id: "warehouse", label: "Warehouse", required: true },
      { id: "user", label: "Username", required: true },
      { id: "password", label: "Password", type: "password", required: true },
    ],
    operations: [
      { id: "query", label: "Query", desc: "Run read-only SELECT queries.", write: false },
      { id: "load", label: "Load data", desc: "Write rows via COPY / INSERT.", write: true },
    ],
  },
  {
    id: "gdrive",
    name: "Google Drive",
    desc: "Connect to Google Drive to read and manage files.",
    icon: "folder_shared",
    tone: "warn",
    category: "File storage",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "clientId", label: "OAuth client ID", required: true },
      { id: "clientSecret", label: "OAuth client secret", type: "password", required: true },
    ],
    operations: [
      { id: "list", label: "List & read files", desc: "Browse folders and read file contents.", write: false },
      { id: "write", label: "Upload & modify files", desc: "Create, rename and update files.", write: true },
    ],
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    desc: "Connect to a SharePoint site for document retrieval.",
    icon: "description",
    tone: "info",
    category: "File storage",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "siteUrl", label: "Site URL", required: true, placeholder: "https://contoso.sharepoint.com/sites/team" },
      { id: "clientId", label: "Client ID", required: true },
      { id: "clientSecret", label: "Client secret", type: "password", required: true },
    ],
    operations: [
      { id: "read", label: "Read documents", desc: "List and download documents from libraries.", write: false },
      { id: "write", label: "Write documents", desc: "Upload and update documents.", write: true },
    ],
  },
  {
    id: "s3",
    name: "Amazon S3",
    desc: "Connect to an S3 bucket to read, write and watch files.",
    icon: "storage",
    tone: "warn",
    category: "File storage",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "Data Lake — Raw Drop" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "bucket", label: "Bucket", required: true, placeholder: "acme-ingest-prod" },
      { id: "region", label: "Region", required: true, placeholder: "us-east-1" },
      { id: "accessKeyId", label: "Access key ID", required: true },
      { id: "secretAccessKey", label: "Secret access key", type: "password", required: true, help: "Stored encrypted; only the person who entered it can update it." },
    ],
    operations: [
      { id: "read", label: "Read files", desc: "Download or ingest objects from the bucket.", write: false },
      { id: "list", label: "List", desc: "Enumerate objects and prefixes.", write: false },
      { id: "watch", label: "Watch", desc: "Receive events when new objects land.", write: false },
      { id: "write", label: "Write files", desc: "Upload or output objects to the bucket.", write: true },
      { id: "move", label: "Move / copy", desc: "Relocate or duplicate objects.", write: true },
      { id: "delete", label: "Delete files", desc: "Permanently remove objects.", write: true, risk: "destructive" },
    ],
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    desc: "Connect to a ServiceNow instance to manage records.",
    icon: "support_agent",
    tone: "success",
    category: "Databases",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "instance", label: "Instance", required: true, placeholder: "myorg.service-now.com" },
      { id: "user", label: "Username", required: true },
      { id: "password", label: "Password", type: "password", required: true },
    ],
    operations: [
      { id: "read", label: "Read records", desc: "Query incidents, requests and tables.", write: false },
      { id: "create", label: "Create records", desc: "Open new incidents or requests.", write: true },
      { id: "update", label: "Update records", desc: "Modify existing records.", write: true },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    desc: "Connect to a Slack workspace to read and post messages.",
    icon: "forum",
    tone: "success",
    category: "Messaging",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "botToken", label: "Bot token", type: "password", required: true, placeholder: "xoxb-…" },
    ],
    operations: [
      { id: "read", label: "Read messages", desc: "Read channel history and threads.", write: false },
      { id: "post", label: "Post messages", desc: "Send messages to channels.", write: true },
    ],
  },
  {
    id: "http",
    name: "HTTP / REST API",
    desc: "Connect to an HTTP endpoint with an allow-listed base URL.",
    icon: "public",
    tone: "warn",
    category: "APIs & web",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "baseUrl", label: "Base URL", required: true, placeholder: "https://api.example.com" },
      { id: "apiKey", label: "API key", type: "password" },
    ],
    operations: [
      { id: "get", label: "GET", desc: "Read data via GET requests.", write: false },
      { id: "write", label: "POST / PUT / DELETE", desc: "Send mutating requests.", write: true },
    ],
  },
  {
    id: "mcp",
    name: "MCP Server",
    desc: "Connect to an MCP server and call the tools it exposes.",
    icon: "extension",
    tone: "success",
    category: "MCP servers",
    fields: [
      { id: "name", label: "Integration name", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "url", label: "MCP server URL", required: true, placeholder: "https://mcp.example.com" },
      { id: "apiKey", label: "API key", type: "password" },
    ],
    operations: [
      { id: "list", label: "List tools", desc: "Discover tools exposed by the server.", write: false },
      { id: "invoke", label: "Invoke tools", desc: "Execute tools that perform actions.", write: true },
    ],
  },
  {
    id: "kafka",
    name: "Apache Kafka",
    desc: "Connect to a Kafka cluster to consume and publish events.",
    icon: "hub",
    tone: "warn",
    category: "Messaging",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "Orders Event Bus" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "bootstrapServers", label: "Bootstrap servers", required: true, placeholder: "pkc-xxxx.us-east-1.aws.confluent.cloud:9092" },
      { id: "topicPrefix", label: "Topic prefix", placeholder: "orders." },
      { id: "saslUsername", label: "SASL username", required: true },
      { id: "saslPassword", label: "SASL password", type: "password", required: true },
    ],
    operations: [
      { id: "subscribe", label: "Subscribe", desc: "Consume events from allow-listed topics.", write: false },
      { id: "publish", label: "Publish", desc: "Push an event onto a stream — cannot be recalled.", write: true, risk: "destructive" },
    ],
  },
  {
    id: "openai",
    name: "Azure OpenAI",
    desc: "Connect to a model endpoint for inference, embeddings and transcription.",
    icon: "neurology",
    tone: "success",
    category: "Models",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "GPT-4o — East US" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "endpoint", label: "Endpoint", required: true, placeholder: "https://acme.openai.azure.com" },
      { id: "deployment", label: "Deployment", required: true, placeholder: "gpt-4o" },
      { id: "apiKey", label: "API key", type: "password", required: true },
    ],
    operations: [
      { id: "invoke", label: "Invoke", desc: "Send a prompt and receive a completion.", write: false },
      { id: "embed", label: "Embed", desc: "Generate vector embeddings for text.", write: false },
      { id: "transcribe", label: "Transcribe", desc: "Convert speech to text.", write: false },
      { id: "classify", label: "Classify", desc: "Run a classification model over inputs.", write: false },
    ],
  },
  {
    id: "temporal",
    name: "Temporal",
    desc: "Connect to a workflow engine to trigger and manage jobs.",
    icon: "rocket_launch",
    tone: "info",
    category: "Execution",
    fields: [
      { id: "name", label: "Integration name", required: true, placeholder: "Reconciliation Jobs" },
      { id: "description", label: "Description", type: "textarea" },
      { id: "address", label: "Server address", required: true, placeholder: "acme.tmprl.cloud:7233" },
      { id: "namespace", label: "Namespace", required: true, placeholder: "acme-prod" },
      { id: "apiKey", label: "API key", type: "password", required: true },
    ],
    operations: [
      { id: "trigger", label: "Trigger", desc: "Start an external workflow.", write: true },
      { id: "execute", label: "Execute", desc: "Run an activity or function synchronously.", write: true },
      { id: "schedule", label: "Schedule", desc: "Queue a job for later execution.", write: true },
      { id: "cancel", label: "Cancel", desc: "Stop a running job — work in flight is lost.", write: true, risk: "destructive" },
    ],
  },
];

// ---------------- Step 1: pick source ----------------

const RRSourceStep = ({ selected, onSelect, query, onQuery }) => {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? RR_SOURCES.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
    : RR_SOURCES;

  return (
    <>
      <p className="rr-helper">
        Choose the external source this integration connects to. Once created, it is
        available org-wide to any workflow — no workspace binding required.
      </p>
      <div className="rr-connector-search">
        <label className="search-field" style={{ width: "100%" }}>
          <input
            placeholder="Search sources..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          <Icon name="search" size={18} />
        </label>
      </div>
      <div className="rr-connector-grid">
        {filtered.map(s => (
          <button
            key={s.id}
            className={`rr-connector-card${selected === s.id ? " selected" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="rr-connector-head">
              <span className={`rr-connector-icon tone-${s.tone}`}>
                <Icon name={s.icon} size={20} />
              </span>
              <span className="rr-connector-name">{s.name}</span>
            </div>
            <div className="rr-connector-desc">{s.desc}</div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="rr-empty">No sources match "{query}".</div>
        )}
      </div>
    </>
  );
};

// ---------------- Step 2: credentials ----------------

const RRField = ({ field, value, onChange, error }) => {
  const showError = error && !value;
  const inputCls = `rr-input${showError ? " err" : ""}`;
  let control;
  if (field.type === "textarea") {
    control = (
      <textarea
        className={inputCls}
        rows={3}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (field.type === "select") {
    control = (
      <div className="rr-select-wrap">
        <select
          className={inputCls}
          value={value || (field.options && field.options[0]) || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <Icon name="expand_more" size={18} />
      </div>
    );
  } else if (field.type === "password") {
    control = (
      <div className="rr-input-with-icon">
        <Icon name="lock" size={16} />
        <input
          className={inputCls}
          type="password"
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  } else {
    control = (
      <input
        className={inputCls}
        type="text"
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <div className="rr-field">
      <label className="rr-label">
        {field.label}
        {field.required && <span className="rr-req">*</span>}
      </label>
      {control}
      {showError
        ? <div className="rr-err-msg">{field.label} is required</div>
        : (field.help && <div className="rr-help">{field.help}</div>)}
    </div>
  );
};

const RRCredentialsFields = ({ source, values, onChange, errors }) => (
  <div className="rr-form">
    {source.fields.map(f => (
      <RRField
        key={f.id}
        field={f}
        value={values[f.id]}
        onChange={(v) => onChange(f.id, v)}
        error={errors[f.id]}
      />
    ))}
  </div>
);

// ---------------- Step 3: operations ----------------

// Operation badge — read (retrieve), write (modify), or destructive
// (high-stakes / irreversible). Destructive ops still carry write: true so the
// presets treat them as writes, but they route to a tighter execution ring.
const RROpBadge = ({ op }) => {
  const cls = op.risk === "destructive" ? "destructive" : op.write ? "write" : "read";
  const label = op.risk === "destructive" ? "Destructive" : op.write ? "Write" : "Read";
  return <span className={`rr-op-badge ${cls}`}>{label}</span>;
};

const RR_PRESETS = [
  { key: "read", title: "Read only", desc: "Retrieve data — no changes.", icon: "visibility" },
  { key: "write", title: "Read & write", desc: "Retrieve and modify data.", icon: "edit" },
  { key: "custom", title: "Custom", desc: "Pick individual operations.", icon: "tune" },
];

// Compute the selected-ops map for a preset.
const presetOps = (source, key) => {
  const map = {};
  source.operations.forEach(op => {
    map[op.id] = key === "write" ? true : key === "read" ? !op.write : false;
  });
  return map;
};

const RROperationsFields = ({ source, access, onAccess, selectedOps, onToggleOp }) => (
  <>
    <div className="rr-access-seg">
      {RR_PRESETS.map(p => (
        <button
          key={p.key}
          className={`rr-access-opt${access === p.key ? " selected" : ""}`}
          onClick={() => onAccess(p.key)}
        >
          <Icon name={p.icon} size={18} />
          <span className="rr-access-title">{p.title}</span>
          <span className="rr-access-desc">{p.desc}</span>
        </button>
      ))}
    </div>

    <div className="rr-op-list">
      {source.operations.map(op => {
        const on = !!selectedOps[op.id];
        return (
          <button
            key={op.id}
            className={`rr-op-row${on ? " on" : ""}`}
            onClick={() => onToggleOp(op.id)}
          >
            <span className="rr-op-check">
              <Icon name={on ? "check_box" : "check_box_outline_blank"} size={20} />
            </span>
            <span className="rr-op-main">
              <span className="rr-op-label">
                {op.label}
                <RROpBadge op={op} />
              </span>
              <span className="rr-op-desc">{op.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  </>
);

// ---------------- Step 2: configure (credentials + operations) ----------------

const RRConfigureStep = ({
  source, values, onChange, errors,
  access, onAccess, selectedOps, onToggleOp,
}) => (
  <>
    <p className="rr-helper">
      Set the credentials used to connect to <strong>{source.name}</strong> and the
      operations this integration may perform. Credentials are stored encrypted and
      never exposed to workflow authors.
    </p>

    <div className="ic-group-label">Credentials</div>
    <RRCredentialsFields
      source={source}
      values={values}
      onChange={onChange}
      errors={errors}
    />

    <div className="ic-group-label">
      Allowed operations
      <span className="ic-group-hint">Workflows can never exceed this scope</span>
    </div>
    <RROperationsFields
      source={source}
      access={access}
      onAccess={onAccess}
      selectedOps={selectedOps}
      onToggleOp={onToggleOp}
    />
  </>
);

// ---------------- Step 3: success ----------------

const RRSuccessStep = ({ name, opCount, onClose }) => (
  <div className="rr-success">
    <div className="rr-success-icon">
      <Icon name="check_circle" size={32} />
    </div>
    <div className="rr-success-title">Integration created</div>
    <div className="rr-success-name">{name}</div>
    <p className="rr-success-body">
      <span className="rr-success-strong">{name}</span> is now in the org-level integration
      pool with {opCount} allowed {opCount === 1 ? "operation" : "operations"}, immediately
      available as a node in Studio for any workflow.
    </p>
    <div className="rr-success-actions">
      <Button variant="primary" size="sm" onClick={onClose}>Done</Button>
    </div>
  </div>
);

// ---------------- Modal shell ----------------

const RegisterIntegrationModal = ({ open, onClose, onComplete }) => {
  const [step, setStep] = React.useState(1);
  const [sourceId, setSourceId] = React.useState(null);
  const [pickerQuery, setPickerQuery] = React.useState("");
  const [values, setValues] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [access, setAccess] = React.useState("read");
  const [selectedOps, setSelectedOps] = React.useState({});
  const [submitted, setSubmitted] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) {
      setStep(1); setSourceId(null); setPickerQuery("");
      setValues({}); setErrors({}); setAccess("read");
      setSelectedOps({}); setSubmitted(null);
    }
  }, [open]);

  if (!open) return null;

  const source = sourceId ? RR_SOURCES.find(s => s.id === sourceId) : null;
  const stepLabels = ["Source", "Configure"];
  const opCount = Object.values(selectedOps).filter(Boolean).length;

  const onChangeField = (id, v) => {
    setValues(s => ({ ...s, [id]: v }));
    if (errors[id]) setErrors(e => ({ ...e, [id]: false }));
  };

  const onAccess = (key) => {
    setAccess(key);
    if (key !== "custom") setSelectedOps(presetOps(source, key));
  };

  const onToggleOp = (id) => {
    setAccess("custom");
    setSelectedOps(s => ({ ...s, [id]: !s[id] }));
  };

  const goNext = () => {
    if (step === 1 && sourceId) {
      // initialise operations to the Read-only preset on first entry
      setAccess("read");
      setSelectedOps(presetOps(source, "read"));
      setStep(2);
    } else if (step === 2) {
      const errs = {};
      source.fields.forEach(f => {
        if (f.required && !values[f.id]) errs[f.id] = true;
      });
      setErrors(errs);
      if (Object.keys(errs).length === 0 && opCount > 0) {
        const name = values.name || source.name;
        const ops = source.operations.filter(o => selectedOps[o.id]).map(o => o.label);
        setSubmitted({ name, opCount: ops.length });
        setStep(3);
        onComplete && onComplete({ name, type: source.category, source: source.name, operations: ops });
      }
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
  };

  const canAdvance =
    (step === 1 && !!sourceId) ||
    (step === 2 && opCount > 0);

  const titleByStep = {
    1: "Create an integration",
    2: source ? `Configure ${source.name}` : "Configure integration",
    3: "All set",
  };

  return (
    <div className="rr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rr-modal" role="dialog" aria-modal="true">
        <div className="rr-modal-head">
          <div className="rr-modal-title-row">
            <h2 className="rr-modal-title">{titleByStep[step]}</h2>
            <button className="rr-close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
          {step <= 2 && (
            <ol className="rr-stepper">
              {stepLabels.map((lbl, i) => {
                const n = i + 1;
                const state = n < step ? "done" : n === step ? "current" : "todo";
                return (
                  <li key={lbl} className={`rr-step ${state}`}>
                    <span className="rr-step-num">
                      {state === "done" ? <Icon name="check" size={14} /> : n}
                    </span>
                    <span className="rr-step-lbl">{lbl}</span>
                    {n < stepLabels.length && <span className="rr-step-bar" />}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rr-modal-body">
          {step === 1 && (
            <RRSourceStep
              selected={sourceId}
              onSelect={setSourceId}
              query={pickerQuery}
              onQuery={setPickerQuery}
            />
          )}
          {step === 2 && source && (
            <RRConfigureStep
              source={source}
              values={values}
              onChange={onChangeField}
              errors={errors}
              access={access}
              onAccess={onAccess}
              selectedOps={selectedOps}
              onToggleOp={onToggleOp}
            />
          )}
          {step === 3 && submitted && (
            <RRSuccessStep
              name={submitted.name}
              opCount={submitted.opCount}
              onClose={onClose}
            />
          )}
        </div>

        {step <= 2 && (
          <div className="rr-modal-foot">
            {step > 1 ? (
              <Button variant="secondary" size="sm" onClick={goBack}>Back</Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            )}
            <div className="rr-foot-spacer" />
            <button
              className={`btn btn-primary btn-sm${canAdvance ? "" : " is-disabled"}`}
              onClick={canAdvance ? goNext : undefined}
              disabled={!canAdvance}
            >
              {step === 2 ? "Create integration" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { RegisterIntegrationModal });
