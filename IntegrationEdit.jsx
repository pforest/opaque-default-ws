// Edit a registered integration.
//
// Editing is NOT the same as registering. Three things change:
//   1. The source is fixed — you can't turn a Salesforce connection into a
//      Postgres one. It shows as a locked identity, not a picker. No stepper.
//   2. Credentials already exist — secrets are masked with a Replace affordance
//      and provenance ("last updated by …"), never re-typed wholesale.
//   3. The connection is ALREADY IN USE. Editing the governance ceiling has a
//      blast radius: tightening it (removing an op, locking a builder-set field)
//      can break workflows already relying on it. The form makes that live and
//      visible, and a confirm step lists exactly what is affected before saving.
//
// Consumes the shared SF_GOV_CONNECTION so it stays consistent with the create
// form, the builder node config, and the governance summary.

// Map each operation label -> the workflows currently using it (from usage).
const ieOpUsage = (conn) => {
  const m = {};
  conn.usage.forEach((u) => {
    u.ops.forEach((label) => {
      (m[label] = m[label] || []).push(u.workflow);
    });
  });
  return m;
};

// --- masked credential row with a Replace affordance ---
const IECredentialSecret = ({ label, lastBy, lastOn }) => {
  const [replacing, setReplacing] = React.useState(false);
  const [val, setVal] = React.useState("");
  return (
    <div className="rr-field">
      <label className="rr-label">{label}</label>
      {replacing ? (
        <>
          <div className="rr-input-with-icon">
            <Icon name="lock" size={16} />
            <input className="rr-input" type="password" autoFocus placeholder="Enter new secret"
              value={val} onChange={(e) => setVal(e.target.value)} />
          </div>
          <button type="button" className="ie-secret-cancel" onClick={() => { setReplacing(false); setVal(""); }}>
            Keep existing secret
          </button>
        </>
      ) : (
        <div className="ie-secret-row">
          <span className="ie-secret-mask"><Icon name="lock" size={15} />••••••••••••</span>
          <button type="button" className="ie-secret-replace" onClick={() => setReplacing(true)}>Replace</button>
        </div>
      )}
      <div className="rr-help">Last updated by {lastBy} · {lastOn}. Only that person can replace it.</div>
    </div>
  );
};

// --- confirmation dialog shown before a tightening save ---
const IEConfirmDialog = ({ changes, affected, onCancel, onConfirm }) => (
  <div className="ie-confirm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
    <div className="ie-confirm" role="dialog" aria-modal="true">
      <div className="ie-confirm-head">
        <span className="ie-confirm-icon"><Icon name="warning" size={20} /></span>
        <div>
          <h3 className="ie-confirm-title">Tightening the governance ceiling</h3>
          <p className="ie-confirm-sub">
            These changes narrow what the connection permits. Workflows already using it will be
            re-validated and may stop working until a builder adjusts them.
          </p>
        </div>
      </div>

      <div className="ie-confirm-section-label">Changes</div>
      <ul className="ie-change-list">
        {changes.map((c, i) => (
          <li key={i}><Icon name="arrow_right_alt" size={16} />{c}</li>
        ))}
      </ul>

      <div className="ie-confirm-section-label">{affected.length} affected {affected.length === 1 ? "workflow" : "workflows"}</div>
      <div className="ie-affected-list">
        {affected.map((a, i) => (
          <div key={i} className="ie-affected-row">
            <span className="ie-affected-dot" />
            <div className="ie-affected-main">
              <div className="ie-affected-wf">{a.workflow}</div>
              <div className="ie-affected-why">{a.why}</div>
            </div>
            <span className="ie-affected-node">{a.node}</span>
          </div>
        ))}
      </div>

      <div className="ie-confirm-foot">
        <Button variant="secondary" size="sm" onClick={onCancel}>Back to editing</Button>
        <div className="rr-foot-spacer" />
        <button className="btn btn-destructive btn-sm" onClick={onConfirm}>Save &amp; re-validate</button>
      </div>
    </div>
  </div>
);

const EditIntegrationModal = ({ connection, onClose, embedded = false, presetState = "edit" }) => {
  const conn = connection || window.SF_GOV_CONNECTION;
  const opUsage = React.useMemo(() => ieOpUsage(conn), [conn]);

  // Operation permit map keyed by label (the usage data is label-based).
  const [perm, setPerm] = React.useState(() => {
    const m = {}; conn.operations.forEach((o) => { m[o.id] = o.permitted; }); return m;
  });
  // Scope lock state.
  const [scope, setScope] = React.useState(() => {
    const m = {}; conn.scope.forEach((s) => { m[s.id] = { locked: s.locked, value: s.value }; }); return m;
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Preset a tightening change for the showcase "impact" state.
  React.useEffect(() => {
    if (presetState === "impact") {
      setPerm((p) => ({ ...p, update: false }));            // remove an in-use op
      setScope((s) => ({ ...s, recordFilter: { ...s.recordFilter, locked: true } }));
    }
    if (presetState === "confirm") {
      setPerm((p) => ({ ...p, update: false }));
      setConfirmOpen(true);
    }
  }, [presetState]);

  // Detect tightening: an op that was permitted+in-use is now off, or a
  // builder-set scope field has been locked.
  const removedInUse = conn.operations.filter(
    (o) => o.permitted && !perm[o.id] && (opUsage[o.label] || []).length > 0
  );
  const newlyLocked = conn.scope.filter((s) => !s.locked && scope[s.id] && scope[s.id].locked);

  const changes = [
    ...removedInUse.map((o) => `Remove “${o.label}” from allowed operations`),
    ...newlyLocked.map((s) => `Lock “${s.label}” — builders can no longer change it`),
  ];

  // Affected workflows = those using any removed op.
  const affectedMap = {};
  removedInUse.forEach((o) => {
    (opUsage[o.label] || []).forEach((wf) => {
      const usage = conn.usage.find((u) => u.workflow === wf);
      affectedMap[wf] = affectedMap[wf] || { workflow: wf, node: usage ? usage.node : "", whys: [] };
      affectedMap[wf].whys.push(`loses “${o.label}”`);
    });
  });
  const affected = Object.values(affectedMap).map((a) => ({ ...a, why: a.whys.join(", ") }));

  const tightening = changes.length > 0;

  const toggleOp = (o) => setPerm((p) => ({ ...p, [o.id]: !p[o.id] }));
  const setScopeLocked = (id, locked) => setScope((s) => ({ ...s, [id]: { ...s[id], locked } }));

  const onSaveClick = () => {
    if (tightening) setConfirmOpen(true);
    else onClose && onClose();
  };

  const card = (
    <div className={`rr-modal ic-modal${embedded ? " rr-modal--embedded" : ""}`} role="dialog" aria-modal="true">
      <div className="rr-modal-head">
        <div className="rr-modal-title-row">
          <div className="ic-modal-id">
            <span className={`rr-connector-icon tone-${conn.tone || "info"}`}><Icon name={conn.icon} size={18} /></span>
            <div>
              <h2 className="rr-modal-title">Edit integration</h2>
              <div className="ic-modal-sub">{conn.source} · {conn.name}</div>
            </div>
          </div>
          <button className="rr-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="ie-head-meta">
          <span className="ie-source-lock"><Icon name="lock" size={13} />Source can't be changed</span>
          <span className="ie-meta-dot">·</span>
          <span>Owned by {conn.owner}</span>
          <span className="ie-meta-dot">·</span>
          <span>Created {conn.created}</span>
          <span className="ie-inuse-pill"><span className="ie-inuse-glow" />In use by {conn.usage.length} workflows</span>
        </div>
      </div>

      <div className="rr-modal-body">
        {/* live blast-radius banner */}
        <div className={`ie-impact${tightening ? " hot" : ""}`}>
          <Icon name={tightening ? "warning" : "info"} size={18} />
          <div className="ie-impact-txt">
            {tightening ? (
              <>
                <strong>{affected.length} {affected.length === 1 ? "workflow" : "workflows"} will be affected.</strong>{" "}
                You're narrowing the ceiling. Widening (adding operations, unlocking fields) is always safe —
                tightening re-validates every workflow using this connection.
              </>
            ) : (
              <>This connection is shared org-wide and used by <strong>{conn.usage.length} workflows</strong>.
                Widening the ceiling is safe; removing an operation or locking a field can break agents already relying on it.</>
            )}
          </div>
        </div>

        {/* Layer 1 — credentials */}
        <div className="gov-section-head">
          <span className="gov-section-icon" style={{ background: "rgba(172,182,185,0.16)", color: "var(--opq-ink-100)" }}><Icon name="key" size={16} /></span>
          <div className="gov-section-titles">
            <div className="gov-section-title">Credentials · Layer 1</div>
            <div className="gov-section-desc">Saved to the connection, never shown to builders. Editing here re-authenticates every workflow automatically.</div>
          </div>
        </div>
        <div className="rr-form">
          <div className="rr-field">
            <label className="rr-label">Integration name</label>
            <input className="rr-input" defaultValue={conn.name} />
          </div>
          <div className="rr-field">
            <label className="rr-label">Instance URL</label>
            <input className="rr-input" defaultValue={conn.instanceUrl} />
          </div>
          <div className="rr-field">
            <label className="rr-label">Consumer key</label>
            <input className="rr-input" defaultValue="3MVG9…QY2" />
          </div>
          <IECredentialSecret label="Consumer secret" lastBy={conn.owner} lastOn={conn.created} />
        </div>

        {/* Layer 2 — governance ceiling */}
        <div className="gov-section-head">
          <span className="gov-section-icon gov"><Icon name="shield" size={16} /></span>
          <div className="gov-section-titles">
            <div className="gov-section-title">Governance ceiling · Layer 2</div>
            <div className="gov-section-desc">The maximum any workflow may do. Only {conn.ownerRole} / Global Admin can change it.</div>
          </div>
        </div>

        <div className="ic-group-label">
          Allowed operations
          <span className="ic-group-hint">Operations in use are flagged — removing one breaks those workflows</span>
        </div>
        <div className="rr-op-list">
          {conn.operations.map((o) => {
            const on = !!perm[o.id];
            const users = opUsage[o.label] || [];
            const removing = o.permitted && !on && users.length > 0;
            return (
              <button key={o.id} className={`rr-op-row${on ? " on" : ""}${removing ? " ie-op-removing" : ""}`} onClick={() => toggleOp(o)}>
                <span className="rr-op-check"><Icon name={on ? "check_box" : "check_box_outline_blank"} size={20} /></span>
                <span className="rr-op-main">
                  <span className="rr-op-label">
                    {o.label}
                    <span className={`rr-op-badge ${o.write ? "write" : "read"}`}>{o.write ? "Write" : "Read"}</span>
                    {users.length > 0 && (
                      <span className="ie-inuse-chip"><Icon name="conversion_path" size={12} />In use · {users.length}</span>
                    )}
                  </span>
                  {removing && (
                    <span className="ie-op-warn">
                      <Icon name="error" size={13} />
                      Removing this breaks: {users.join(", ")}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ic-group-label" style={{ marginTop: 18 }}>
          Scope constraints
          <span className="ic-group-hint">Lock to enforce for everyone, or leave builder-set</span>
        </div>
        {conn.scope.map((s) => {
          const locked = scope[s.id] && scope[s.id].locked;
          return (
            <div key={s.id} className={`gov-field${locked ? " locked" : ""}`}>
              <div className="gov-field-top">
                <div className="gov-field-main">
                  <div className="gov-field-label"><Icon name={locked ? "lock" : "lock_open"} size={15} />{s.label}</div>
                  <div className="gov-field-help">{s.help}</div>
                </div>
                <div className="gov-lock-seg">
                  <button type="button" className={`gov-lock-opt is-lock${locked ? " active" : ""}`} onClick={() => setScopeLocked(s.id, true)}>
                    <Icon name="lock" size={15} />Locked
                  </button>
                  <button type="button" className={`gov-lock-opt${!locked ? " active" : ""}`} onClick={() => setScopeLocked(s.id, false)}>
                    Builder-set
                  </button>
                </div>
              </div>
              <div className="gov-field-value">
                <label className="rr-label">
                  {locked ? "Locked value" : "Default value"}
                  <span className={`gov-value-tag ${locked ? "locked" : "builder"}`}>{locked ? "Builders inherit" : "Optional"}</span>
                </label>
                <input className="rr-input" defaultValue={s.value} />
              </div>
            </div>
          );
        })}

        {/* Layer 3 — config defaults */}
        <div className="gov-section-head">
          <span className="gov-section-icon cfg"><Icon name="tune" size={16} /></span>
          <div className="gov-section-titles">
            <div className="gov-section-title">Configuration defaults · set by builders</div>
            <div className="gov-section-desc">Pre-fills the field for builders. Never locked — changing it only affects new workflows.</div>
          </div>
        </div>
        <div className="rr-form">
          {conn.config.map((c) => (
            <div key={c.id} className="rr-field">
              <label className="rr-label">{c.label}</label>
              <input className="rr-input" defaultValue={c.value} />
            </div>
          ))}
        </div>
      </div>

      <div className="rr-modal-foot">
        <button className="btn btn-destructive btn-sm ie-unregister"><Icon name="link_off" size={16} />Unregister</button>
        <div className="rr-foot-spacer" />
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        {tightening ? (
          <button className="btn btn-primary btn-sm ie-save-hot" onClick={onSaveClick}>
            <Icon name="warning" size={16} />Review impact &amp; save
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onSaveClick}>Save changes</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {embedded ? card : (
        <div className="rr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          {card}
        </div>
      )}
      {confirmOpen && (
        <IEConfirmDialog
          changes={changes.length ? changes : ["Remove “Update records” from allowed operations"]}
          affected={affected}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); onClose && onClose(); }}
        />
      )}
    </>
  );
};

Object.assign(window, { EditIntegrationModal });
