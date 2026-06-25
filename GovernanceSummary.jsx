// Read-only governance summary — the 3-layer model for a single connection,
// shown to anyone reviewing how a connection is governed and used. Consumes
// the shared SF_GOV_CONNECTION so it stays consistent with the creation form
// (Layer 1+2) and the builder node config (Layer 3).

const GovOpChip = ({ op, muted }) =>
  muted
    ? <span className="gv-op-muted">{op.label}</span>
    : (
      <span className="rr-op-badge-wrap" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "white", fontSize: 13 }}>{op.label}</span>
        <span className={`rr-op-badge ${op.write ? "write" : "read"}`}>{op.write ? "Write" : "Read"}</span>
      </span>
    );

const GovernanceSummary = ({ connection }) => {
  const conn = connection || window.SF_GOV_CONNECTION;
  const permitted = conn.operations.filter((o) => o.permitted);
  const blocked = conn.operations.filter((o) => !o.permitted);

  return (
    <div className="gv-summary">
      {/* Layer 1 — Connection */}
      <div className="gv-layer l1">
        <div className="gv-layer-head">
          <span className="gv-layer-num">1</span>
          <div className="gv-layer-titles">
            <div className="gv-layer-eyebrow">Connection</div>
            <div className="gv-layer-title">{conn.name}</div>
          </div>
          <div className="gv-layer-aside">Reused across workflows</div>
        </div>
        <dl className="gv-rows">
          <dt>Source</dt>
          <dd>{conn.source}</dd>
          <dt>Instance URL</dt>
          <dd className="mono">{conn.instanceUrl}</dd>
          <dt>Credentials</dt>
          <dd><Icon name="lock" size={13} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--opq-ink-400)" }} />•••••••• · stored encrypted, never shown to builders</dd>
          <dt>Owner</dt>
          <dd>{conn.owner} · {conn.ownerRole}</dd>
          <dt>Created</dt>
          <dd>{conn.created}</dd>
        </dl>
      </div>

      <div className="gv-connector" />

      {/* Layer 2 — Governance ceiling */}
      <div className="gv-layer l2">
        <div className="gv-layer-head">
          <span className="gv-layer-num">2</span>
          <div className="gv-layer-titles">
            <div className="gv-layer-eyebrow">Governance ceiling</div>
            <div className="gv-layer-title">What is ever permitted</div>
          </div>
          <div className="gv-layer-aside">Only Owner / Global Admin<br />can change</div>
        </div>
        <dl className="gv-rows" style={{ marginBottom: 16 }}>
          <dt>Allowed operations</dt>
          <dd>
            <div className="gv-ops">
              {permitted.map((op, i) => (
                <React.Fragment key={op.id}>
                  <GovOpChip op={op} />
                  {i < permitted.length - 1 && <span style={{ color: "var(--opq-ink-600)" }}>·</span>}
                </React.Fragment>
              ))}
            </div>
            {blocked.length > 0 && (
              <div className="gv-ops" style={{ marginTop: 8 }}>
                {blocked.map((op) => <GovOpChip key={op.id} op={op} muted />)}
              </div>
            )}
          </dd>
        </dl>
        <div className="gv-constraints">
          {conn.scope.map((s) => (
            <div key={s.id} className="gv-constraint">
              <span className={`gv-lock-chip ${s.locked ? "locked" : "builder"}`}>
                <Icon name={s.locked ? "lock" : "lock_open"} size={12} />
                {s.locked ? "Locked" : "Builder-set"}
              </span>
              <div className="gv-constraint-body">
                <div className="gv-constraint-label">{s.label}</div>
                <div className="gv-constraint-val">
                  {s.value}
                  {!s.locked && <span style={{ color: "var(--opq-ink-400)", fontFamily: "var(--font-sans)" }}>  · default, builders may narrow</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gv-connector" />

      {/* Layer 3 — Agent usage */}
      <div className="gv-layer l3">
        <div className="gv-layer-head">
          <span className="gv-layer-num">3</span>
          <div className="gv-layer-titles">
            <div className="gv-layer-eyebrow">Agent usage</div>
            <div className="gv-layer-title">How agents use it, within the ceiling</div>
          </div>
          <div className="gv-layer-aside">{conn.usage.length} workflows</div>
        </div>
        <div className="gv-usage">
          {conn.usage.map((u, i) => (
            <div key={i} className="gv-usage-row">
              <div className="gv-usage-head">
                <span className="gv-usage-wf">{u.workflow}</span>
                <span className="gv-usage-sep">/</span>
                <span className="gv-usage-node">{u.node}</span>
              </div>
              <dl className="gv-usage-detail">
                <dt>Operations</dt>
                <dd>{u.ops.join(", ")}</dd>
                <dt>Object</dt>
                <dd><Icon name="lock" size={12} style={{ verticalAlign: "-2px", marginRight: 4, color: "var(--opq-warn-500)" }} />{u.object} <span style={{ color: "var(--opq-ink-500)" }}>(locked)</span></dd>
                <dt>Record filter</dt>
                <dd className="mono">{u.filter}</dd>
                <dt>Max records</dt>
                <dd className="mono">{u.maxRecords}</dd>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { GovernanceSummary });
