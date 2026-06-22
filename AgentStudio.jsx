// Agent Studio — canvas / node-graph detail view for a single agent (workflow).
// Pan (drag background), zoom (buttons / wheel), draggable nodes, attestation
// badges, and bezier edges between ports. Simplified per request to five nodes:
// Start → LLM → (Tool, Data Connector) → End.

const MiniToggle = ({ on }) => (
  <span className={`as-mini-toggle${on ? " on" : ""}`}><span className="knob" /></span>
);

const Field = ({ label, value, mono }) => (
  <div>
    <div className="as-field-label">{label}</div>
    <div className={`as-field-value${mono ? " mono" : ""}`}>{value}</div>
  </div>
);

// ---- Node geometry: heights are fixed so edge anchors are deterministic ----
const NODE_DEFS = {
  start: { w: 200, h: 104 },
  llm:   { w: 264, h: 430 },
  tool:  { w: 274, h: 372 },
  data:  { w: 274, h: 360 },
  end:   { w: 220, h: 120 },
  integration: { w: 280, h: 312 },
};

// Blank workflow (New workflow) — just the Start and End anchors.
const NEW_NODES = [
  { id: "start", kind: "start", x: 200, y: 320 },
  { id: "end",   kind: "end",   x: 860, y: 332 },
];

const INITIAL_NODES = [
  { id: "start", kind: "start", x: 120,  y: 430 },
  { id: "llm",   kind: "llm",   x: 430,  y: 250 },
  { id: "tool",  kind: "tool",  x: 800,  y: 760 },
  { id: "data",  kind: "data",  x: 1110, y: 760 },
  { id: "end",   kind: "end",   x: 1180, y: 270 },
];

// Port anchor helpers (absolute viewport coords) given a node.
const PORTS = {
  start: { output: (n) => ({ x: n.x + NODE_DEFS.start.w, y: n.y + NODE_DEFS.start.h / 2 }) },
  llm: {
    prompt: (n) => ({ x: n.x,                       y: n.y + 118 }),
    output: (n) => ({ x: n.x + NODE_DEFS.llm.w,     y: n.y + 118 }),
    tools:  (n) => ({ x: n.x + NODE_DEFS.llm.w * 0.55, y: n.y + NODE_DEFS.llm.h }),
  },
  tool: { top: (n) => ({ x: n.x + NODE_DEFS.tool.w / 2, y: n.y }) },
  data: { top: (n) => ({ x: n.x + NODE_DEFS.data.w / 2, y: n.y }) },
  end:  { input: (n) => ({ x: n.x, y: n.y + NODE_DEFS.end.h / 2 }) },
};

const EDGES = [
  { from: "start", fromPort: "output", to: "llm",  toPort: "prompt", dir: "h" },
  { from: "llm",   fromPort: "tools",  to: "tool", toPort: "top",    dir: "v" },
  { from: "llm",   fromPort: "tools",  to: "data", toPort: "top",    dir: "v" },
  { from: "llm",   fromPort: "output", to: "end",  toPort: "input",  dir: "h" },
];

const edgePath = (a, b, dir) => {
  if (dir === "v") {
    const off = 70;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + off}, ${b.x} ${b.y - off}, ${b.x} ${b.y}`;
  }
  const off = Math.max(60, Math.abs(b.x - a.x) * 0.45);
  return `M ${a.x} ${a.y} C ${a.x + off} ${a.y}, ${b.x - off} ${b.y}, ${b.x} ${b.y}`;
};

// ---------------- Node renderers ----------------

const StartNode = () => (
  <>
    <div className="as-node-head">
      <span className="as-node-icon"><Icon name="login" size={18} /></span>
      <span className="as-node-title">Start</span>
    </div>
    <div className="as-ports" style={{ justifyContent: "flex-end" }}>
      <span className="as-port-label">Output</span>
    </div>
  </>
);

const LLMNode = ({ node }) => (
  <>
    <div className="as-node-badge as-badge--confidential"><Icon name="lock" size={12} />CONFIDENTIAL</div>
    <div className="as-node-head">
      <span className="as-node-icon"><Icon name="hub" size={18} /></span>
      <span className="as-node-title">{(node && node.title) || "vLLM"}</span>
      <span className="as-node-expand"><Icon name="open_in_full" size={15} /></span>
    </div>
    <div className="as-node-body">
      <div className="as-toolmode"><MiniToggle on={false} /><span className="as-toolmode-label">Tool mode</span></div>
      <Field label="Model name" value="llama" />
      <Field label="Temperature" value="0.7" />
      <Field label="Max tokens" value="2000" />
      <Field label="API Key" value="••••••••••" />
      <div className="as-toolmode"><MiniToggle on={false} /><span className="as-toolmode-label">Guardrails · Disabled</span></div>
    </div>
    <div className="as-ports">
      <span className="as-port-label">Tools</span>
    </div>
  </>
);

const ToolNode = ({ node }) => (
  <>
    <div className="as-node-badge as-badge--attested"><Icon name="lock" size={12} />ATTESTED CONFIG</div>
    <div className="as-node-head">
      <span className="as-node-icon"><Icon name="build" size={18} /></span>
      <span className="as-node-title">{(node && node.title) || "HR_Data_tool"}</span>
      <span className="as-node-expand"><Icon name="open_in_full" size={15} /></span>
    </div>
    <div className="as-node-body">
      <div className="as-toolmode"><MiniToggle on={true} /><span className="as-toolmode-label">Tool mode</span></div>
      <Field label="OpenAPI spec URL" value="http://api.example.com/open…" mono />
      <Field label="OpenAPI base URL" value="https://api.example.com" mono />
      <Field label="Call timeout (ms)" value="15000" />
      <Field label="Tool description" value="Query employee directory inf…" />
      <div className="as-toolmode"><MiniToggle on={false} /><span className="as-toolmode-label">Guardrails · Off</span></div>
    </div>
  </>
);

const DataNode = ({ node }) => (
  <>
    <div className="as-node-badge as-badge--attested"><Icon name="lock" size={12} />ATTESTED CONFIG</div>
    <div className="as-node-head">
      <span className="as-node-icon"><Icon name="database" size={18} /></span>
      <span className="as-node-title">{(node && node.title) || "Claims Data"}</span>
      <span className="as-node-expand"><Icon name="open_in_full" size={15} /></span>
    </div>
    <div className="as-node-body">
      <div className="as-toolmode"><MiniToggle on={true} /><span className="as-toolmode-label">Tool mode</span></div>
      <span className="as-pill-blue"><Icon name="visibility_off" size={13} />No raw data access</span>
      <Field label="Host" value="10.125.0.5" mono />
      <Field label="Port" value="5432" mono />
      <Field label="Database" value="claims_db" mono />
      <Field label="User" value="opaqueadmin" mono />
      <Field label="SSL Mode" value="Require" />
    </div>
  </>
);

const EndNode = () => (
  <>
    <div className="as-node-head">
      <span className="as-node-icon"><Icon name="adjust" size={18} /></span>
      <span className="as-node-title">End</span>
    </div>
    <div className="as-node-body">
      <Field label="Input" value="{{vLLM:output}}" mono />
    </div>
  </>
);

const NODE_RENDER = { start: StartNode, llm: LLMNode, tool: ToolNode, data: DataNode, end: EndNode, integration: IntegrationNode };

// ---------------- Node menu (palette) ----------------

// Palette grouped by source family — what the node connects to — mirroring the
// register flow's source-first model. Tool-vs-pipeline mode and operation risk
// are decided per node on drop, so they live as node metadata, not as palette
// buckets. Models stay their own group: placed directly, with no credentials or
// operations to configure.
const SOURCE_FAMILIES = [
  { key: "models",    label: "Models",       icon: "network_intel_node", kind: "llm",
    items: ["Claude Sonnet 4.5", "Claude Haiku 4.5", "Claude Opus 4", "Llama 3.2", "Falcon H1"] },
  { key: "databases", label: "Databases",    icon: "database" },
  { key: "files",     label: "File storage", icon: "folder_open" },
  { key: "messaging", label: "Messaging",    icon: "forum" },
  { key: "execution", label: "Execution",    icon: "bolt" },
  { key: "apis",      label: "APIs & web",   icon: "language" },
  { key: "mcp",       label: "MCP servers",  icon: "extension" },
];

// Integration families pull their items from the registered catalog by family;
// Models carries its own static list. Empty families are dropped.
const NODE_CATEGORIES = SOURCE_FAMILIES
  .map((f) => f.items
    ? f
    : { ...f, kind: "integration", items: BUILDER_INTEGRATIONS.filter((i) => i.family === f.label) })
  .filter((c) => c.items.length > 0);

const NodeMenu = ({ onStartDrag }) => {
  const [view, setView] = React.useState(null); // null = root, else category key
  const [q, setQ] = React.useState("");
  const cat = NODE_CATEGORIES.find((c) => c.key === view);
  const query = q.trim().toLowerCase();

  const itemName = (it) => (typeof it === "string" ? it : it.name);
  const itemSub  = (it) => (typeof it === "string" ? null : it.source);

  // Flattened search across all categories (root view, query active).
  const flat = NODE_CATEGORIES.flatMap((c) =>
    c.items.map((it) => ({ it, kind: c.kind, cat: c.label }))
  ).filter((x) => itemName(x.it).toLowerCase().includes(query));

  const dragRow = (it, kind, sub) => {
    const name = itemName(it);
    return (
      <div key={name} className="nm-item" onMouseDown={(e) => onStartDrag(e, kind, it)}>
        <span className="nm-grip"><Icon name="drag_indicator" size={16} /></span>
        <span className="nm-item-text">
          <span className="nm-item-name">{name}</span>
          {sub && <span className="nm-item-sub">{sub}</span>}
        </span>
      </div>
    );
  };

  const search = (
    <label className="nm-search" onMouseDown={(e) => e.stopPropagation()}>
      <input placeholder="Search all nodes" value={q} onChange={(e) => setQ(e.target.value)} />
      <Icon name="search" size={18} />
    </label>
  );

  return (
    <div className="nm-panel" onMouseDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
      {view === null ? (
        <>
          {search}
          {query ? (
            <div className="nm-list">
              {flat.length === 0
                ? <div className="nm-empty">No nodes match “{q}”</div>
                : flat.map((x) => dragRow(x.it, x.kind, itemSub(x.it) || x.cat))}
            </div>
          ) : (
            <div className="nm-list">
              {NODE_CATEGORIES.map((c) => (
                <button key={c.key} className="nm-cat" onClick={() => { setView(c.key); setQ(""); }}>
                  <span className="nm-cat-icon"><Icon name={c.icon} size={18} /></span>
                  <span className="nm-cat-label">{c.label}</span>
                  <span className="nm-cat-chev"><Icon name="chevron_right" size={18} /></span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button className="nm-back" onClick={() => { setView(null); setQ(""); }}>
            <Icon name="arrow_back" size={18} />
            <span>{cat.label}</span>
          </button>
          {search}
          <div className="nm-list">
            {cat.items.filter((it) => itemName(it).toLowerCase().includes(query)).length === 0
              ? <div className="nm-empty">No nodes match “{q}”</div>
              : cat.items
                  .filter((it) => itemName(it).toLowerCase().includes(query))
                  .map((it) => dragRow(it, cat.kind, itemSub(it)))}
          </div>
        </>
      )}
    </div>
  );
};

const AgentNode = ({ node, onDragStart }) => {
  const def = NODE_DEFS[node.kind];
  const Body = NODE_RENDER[node.kind];
  const cls =
    node.kind === "llm" ? " as-node--confidential" :
    (node.kind === "tool" || node.kind === "data" || node.kind === "integration") ? " as-node--attested" : "";
  return (
    <div
      className={`as-node${cls}`}
      style={{ left: node.x, top: node.y, width: def.w, minHeight: def.h }}
      onMouseDown={(e) => onDragStart(e, node.id)}
    >
      <Body node={node} />
    </div>
  );
};

// ---------------- Canvas shell ----------------

const AgentStudioCanvas = () => {
  const isNew = React.useMemo(() => new URLSearchParams(location.search).has("new"), []);
  const [nodes, setNodes] = React.useState(isNew ? NEW_NODES : INITIAL_NODES);
  const [zoom, setZoom] = React.useState(isNew ? 0.75 : 0.5);
  const [pan, setPan] = React.useState(isNew ? { x: 60, y: 40 } : { x: 20, y: 24 });
  const [pendingDrop, setPendingDrop] = React.useState(null);

  const drag = React.useRef(null); // { type:'pan'|'node', id, startX, startY, origin }
  const canvasRef = React.useRef(null);
  const [menuDrag, setMenuDrag] = React.useState(null); // { kind, title }
  const [ghost, setGhost] = React.useState({ x: 0, y: 0 });

  const nodeById = (id) => nodes.find((n) => n.id === id);

  const onCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { type: "pan", startX: e.clientX, startY: e.clientY, origin: { ...pan } };
    e.currentTarget.classList.add("panning");
  };

  const onNodeDragStart = (e, id) => {
    e.stopPropagation();
    const n = nodeById(id);
    drag.current = { type: "node", id, startX: e.clientX, startY: e.clientY, origin: { x: n.x, y: n.y } };
  };

  React.useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (d.type === "pan") {
        setPan({ x: d.origin.x + dx, y: d.origin.y + dy });
      } else {
        setNodes((ns) => ns.map((n) =>
          n.id === d.id ? { ...n, x: d.origin.x + dx / zoom, y: d.origin.y + dy / zoom } : n
        ));
      }
    };
    const onUp = () => {
      drag.current = null;
      document.querySelectorAll(".as-canvas.panning").forEach((el) => el.classList.remove("panning"));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [zoom]);

  // Drag a palette item onto the canvas to create a new node.
  const onMenuStartDrag = (e, kind, payload) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuDrag({ kind, payload });
    setGhost({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    if (!menuDrag) return;
    const move = (e) => setGhost({ x: e.clientX, y: e.clientY });
    const up = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inside) {
        const vx = (e.clientX - rect.left - pan.x) / zoom;
        const vy = (e.clientY - rect.top - pan.y) / zoom;
        if (menuDrag.kind === "integration") {
          // Defer placement: configure the integration first.
          setPendingDrop({ integration: menuDrag.payload, x: vx, y: vy });
        } else {
          const def = NODE_DEFS[menuDrag.kind];
          const id = menuDrag.kind + "-" + Date.now();
          setNodes((ns) => [...ns, { id, kind: menuDrag.kind, x: vx - def.w / 2, y: vy - 28, title: menuDrag.payload }]);
        }
      }
      setMenuDrag(null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [menuDrag, pan, zoom]);

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return; // pinch-zoom only; plain wheel left for scroll-pan
    e.preventDefault();
    setZoom((z) => Math.min(1.6, Math.max(0.4, z - e.deltaY * 0.0015)));
  };

  const adjustZoom = (delta) => setZoom((z) => Math.min(1.6, Math.max(0.4, +(z + delta).toFixed(2))));
  const resetView = () => { setZoom(0.5); setPan({ x: 20, y: 24 }); };

  const edges = (isNew ? [] : EDGES).map((e, i) => {
    const a = PORTS[e.from][e.fromPort](nodeById(e.from));
    const b = PORTS[e.to][e.toPort](nodeById(e.to));
    return { i, a, b, d: edgePath(a, b, e.dir) };
  });

  return (
    <div className="as-shell">
      <div className="as-topbar">
        <div className="as-crumbs">
          <a className="as-crumb" href="index.html">Agent Studio</a>
          <span className="as-crumb-sep">/</span>
          <span className="as-crumb-current">{isNew ? "Untitled workflow" : "Employee HR Assist"}</span>
        </div>
        {isNew
          ? <span className="as-run-pill as-run-pill--draft"><span className="as-run-dot" />Draft</span>
          : <span className="as-run-pill"><span className="as-run-dot" />Running</span>}
        <div className="as-topbar-spacer" />
        <button className="icon-btn" title="Info"><Icon name="info" size={20} /></button>
        <button className="icon-btn" title="Attestation"><Icon name="verified_user" size={20} /></button>
        <button className="as-actions-btn">Actions<Icon name="expand_more" size={18} /></button>
      </div>

      <div className="as-canvas" ref={canvasRef} onMouseDown={onCanvasMouseDown} onWheel={onWheel}>
        <div className="as-viewport" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <svg className="as-edges">
            {edges.map((e) => (
              <g key={e.i}>
                <path className="as-edge" d={e.d} />
                <circle className="as-edge-dot" cx={e.a.x} cy={e.a.y} r="4.5" />
                <circle className="as-edge-dot" cx={e.b.x} cy={e.b.y} r="4.5" />
              </g>
            ))}
          </svg>
          {nodes.map((n) => (
            <AgentNode key={n.id} node={n} onDragStart={onNodeDragStart} />
          ))}
        </div>

        <NodeMenu onStartDrag={onMenuStartDrag} />

        <div className="as-zoom">
          <button onClick={() => adjustZoom(0.1)} title="Zoom in"><Icon name="add" size={20} /></button>
          <button onClick={() => adjustZoom(-0.1)} title="Zoom out"><Icon name="remove" size={20} /></button>
          <button onClick={resetView} title="Reset view"><Icon name="fit_screen" size={20} /></button>
        </div>

        {menuDrag && (
          <div className="nm-ghost" style={{ left: ghost.x + 14, top: ghost.y + 12 }}>
            <Icon name="drag_indicator" size={16} />
            <span>{menuDrag.kind === "integration" ? menuDrag.payload.name : menuDrag.payload}</span>
          </div>
        )}

        {typeof ConfigureIntegrationModal !== "undefined" && (
          <ConfigureIntegrationModal
            integration={pendingDrop ? pendingDrop.integration : null}
            onClose={() => setPendingDrop(null)}
            onAdd={(config) => {
              const def = NODE_DEFS.integration;
              const id = "integration-" + Date.now();
              const drop = pendingDrop;
              setNodes((ns) => [...ns, { id, kind: "integration", x: drop.x - def.w / 2, y: drop.y - 24, ...config }]);
              setPendingDrop(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

Object.assign(window, { AgentStudioCanvas });
