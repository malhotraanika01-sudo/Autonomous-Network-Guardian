/* Autonomous Network Guardian - dashboard client.
   Every page polls its JSON endpoint on the monitoring cadence and re-renders. */
(function () {
  "use strict";

  const POLL_MS = 4000;
  const page = document.body.dataset.page;

  // ---- helpers ----------------------------------------------------------
  async function api(path, opts) {
    const res = await fetch(path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts));
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error || res.statusText), { body, status: res.status });
    return body;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function clock(iso) {
    if (!iso) return "--:--:--";
    const d = new Date(iso);
    if (isNaN(d)) return String(iso).slice(11, 19) || "--:--:--";
    return d.toLocaleTimeString([], { hour12: false });
  }

  function statusChip(status) {
    const map = {
      online: ["st-up", "Online"], offline: ["st-down", "Offline"],
      degraded: ["st-warn", "Degraded"], unknown: ["st-res", "Unknown"],
      open: ["st-down", "Open"], resolved: ["st-res", "Resolved"],
    };
    const [cls, label] = map[status] || ["st-res", status || "-"];
    return `<span class="st ${cls}">${esc(label)}</span>`;
  }

  function priorityChip(prio) {
    const cls = { Critical: "st-down", High: "st-warn", Medium: "st-warn", Low: "st-up", None: "st-up" }[prio] || "st-warn";
    return `<span class="st ${cls}">Priority ${esc(prio)}</span>`;
  }

  function flash(msg, isErr) {
    const el = document.getElementById("flash");
    if (!el) return;
    el.innerHTML = `<div class="flash${isErr ? " err" : ""}">${esc(msg)}</div>`;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { el.innerHTML = ""; }, 4000);
  }

  function set(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // ---- header (all pages) --------------------------------------------
  async function refreshHeader() {
    try {
      const m = await api("/api/monitoring");
      const p = m.provider || {};
      set("cycle-meta", `every ${m.cycle_seconds}s &middot; ` +
        (m.last_cycle_at ? `last ${clock(m.last_cycle_at)}` : "starting&hellip;"));
      const label = p.mode === "live" ? "Live monitoring" : (p.scenario_label || "-");
      const lab = document.getElementById("scenario-label");
      if (lab) lab.textContent = label;
      set("scenario-note", esc(p.mode === "live" ? "Real ICMP / socket probes" : (p.scenario_note || "")));
    } catch (e) { /* header stays as-is */ }
  }

  // ---- dashboard ------------------------------------------------------
  function renderHealth(h) {
    const factors = (h.factors || []).map((f) =>
      `<div class="kv"><span>${esc(f.name)}${f.note ? ` &mdash; ${esc(f.note)}` : ""}</span>` +
      `<span class="mono">${f.points} / ${f.max}</span></div>`).join("");
    set("health-body",
      `<div style="display:flex;align-items:flex-end;gap:10px">
         <div class="bignum" style="font-size:82px">${h.score}</div>
         <div style="padding-bottom:10px">
           <div class="mono" style="color:var(--color-neutral-600)">/ 100</div>
           <div style="font-family:var(--font-heading);font-size:20px;letter-spacing:.08em;text-transform:uppercase">${esc(h.status)}</div>
         </div>
       </div>
       <div class="meter"><i style="width:${h.score}%"></i></div>
       <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px">${factors}</div>` +
      ((h.reasons && h.reasons.length)
        ? `<div class="text-muted" style="font-size:11px;margin-top:6px">${esc(h.reasons.join(" · "))}</div>` : ""));
  }

  function renderDiagSummary(d) {
    set("diag-prio", priorityChip(d.priority));
    const affected = (d.affected || []).map((a) => a.name).join(", ") || "—";
    const evidence = (d.evidence || []).map((e) =>
      `<div class="evidence"><span class="tick">✓</span><span>${esc(e.text)}</span>` +
      `<span class="spacer"></span><span class="mono" style="color:var(--color-neutral-600)">${esc(e.score)}</span></div>`).join("");
    set("diag-body",
      `<div style="display:grid;grid-template-columns:minmax(0,1fr) 200px;gap:20px;align-items:start">
         <div>
           <div style="font-family:var(--font-heading);font-weight:600;font-size:30px;line-height:1.05">${esc(d.root_cause)}</div>
           <div class="text-muted" style="font-size:13px;margin-top:4px">Affected devices: <span class="mono">${esc(affected)}</span></div>
           <div style="display:flex;flex-direction:column;gap:5px;margin-top:12px">${evidence}</div>
         </div>
         <div style="border-left:1px solid var(--color-divider);padding-left:16px">
           <div class="lbl">Confidence</div>
           <div class="bignum" style="font-size:44px">${d.confidence}%</div>
           <div class="meter" style="height:6px;margin-top:6px"><i style="width:${d.confidence}%"></i></div>
           <div class="text-muted" style="font-size:11px;margin-top:8px">Rule-based diagnostic score, not a statistical guarantee.</div>
         </div>
       </div>`);
  }

  function renderShared(deps) {
    set("shared-deps", (deps || []).map((d) =>
      `<div class="row" style="justify-content:space-between">
         <span style="font-family:var(--font-heading);font-size:16px;letter-spacing:.05em;text-transform:uppercase">${esc(d.name)}</span>
         <span class="st ${d.ok ? "st-up" : "st-down"}">${esc(d.state)}</span>
       </div>`).join(""));
  }

  function renderDevicesMini(dev) {
    const chips = (dev.list || []).map((d) => {
      const cls = d.status === "offline" ? "off" : d.status === "degraded" ? "deg" : "";
      return `<div class="devchip ${cls}">${esc(d.name)}</div>`;
    }).join("");
    set("devices-mini",
      `<div style="display:flex;align-items:baseline;gap:8px">
         <span class="bignum" style="font-size:38px">${dev.online}</span>
         <span class="mono" style="color:var(--color-neutral-600)">/ ${dev.total} online</span>
       </div>
       <div style="display:flex;gap:4px;margin-top:6px">${chips}</div>`);
  }

  function renderTopology(t) {
    const clients = (t.clients || []).map((c) =>
      `<div class="node ${c.status === "offline" ? "off" : ""}" style="font-size:11px;padding:6px 0">${esc(c.name)}</div>`).join("");
    set("topology",
      `<div class="topo">
         <div class="clients">${clients}</div>
         <div class="drop"></div>
         <div class="node ${t.gateway.ok ? "" : "off"}">Gateway ${t.gateway.ok ? "✓" : "✗"}</div>
         <div class="drop"></div>
         <div class="node ${t.internet.ok ? "" : "off"}" style="border-style:dashed">Internet ${t.internet.ok ? "✓" : "✗"}</div>
       </div>
       <div class="text-muted" style="font-size:11px;margin-top:8px">${esc(t.note || "")}</div>`);
  }

  function renderActiveIncidents(list, lastRecovery) {
    if (!list || !list.length) {
      set("active-incidents",
        `<div class="text-muted" style="font-size:13px;padding:10px 2px">No active incidents.` +
        (lastRecovery ? ` The last closed incident recovered in ${esc(lastRecovery)}.` : "") + `</div>`);
      return;
    }
    const rows = list.map((i) =>
      `<tr>
         <td class="mono">${esc(i.code)}</td>
         <td>${esc(i.root_cause)}</td>
         <td>${priorityChip(i.priority)}</td>
         <td class="mono">${esc((i.affected || []).join(", "))}</td>
         <td class="mono">${clock(i.started_at)}</td>
         <td>${statusChip(i.status)}</td>
         <td style="text-align:right"><a class="btn btn-ghost" href="/incidents/${i.id}">Open</a></td>
       </tr>`).join("");
    set("active-incidents",
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>ID</th><th>Root cause</th><th>Priority</th><th>Affected</th><th>Started</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`);
  }

  function renderEvents(events) {
    set("recent-events", (events || []).map((e) =>
      `<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px dotted var(--color-divider);font-size:12px">
         <span class="mono" style="color:var(--color-neutral-600)">${clock(e.t)}</span><span>${esc(e.text)}</span>
       </div>`).join(""));
  }

  async function renderDashboard() {
    const d = await api("/api/dashboard");
    renderHealth(d.health);
    renderDiagSummary(d.diagnosis);
    renderShared(d.shared_dependencies);
    renderDevicesMini(d.devices);
    renderTopology(d.topology);
    renderActiveIncidents(d.active_incidents, d.last_recovery);
    renderEvents(d.recent_events);
  }

  // ---- devices ------------------------------------------------------
  let depOptions = [];
  let suggestedDevice = { name: "", ip_address: "", device_type: "Computer", role: "Client", depends_on: null };

  async function renderDevices() {
    const d = await api("/api/devices");
    depOptions = d.dependency_options || [];
    if (d.suggested) suggestedDevice = d.suggested;
    const byId = {};
    depOptions.forEach((o) => { byId[o.id] = o.name; });
    set("devices-sub", `${d.online} of ${d.total} online &middot; measurements from the latest monitoring cycle`);
    set("devices-tbody", d.devices.map((x) =>
      `<tr>
         <td style="font-family:var(--font-heading);font-size:16px;letter-spacing:.04em">${esc(x.name)}</td>
         <td class="mono">${esc(x.ip_address)}</td>
         <td>${esc(x.device_type)}</td>
         <td>${esc(x.role)}</td>
         <td class="mono">${esc(x.depends_on ? byId[x.depends_on] || "#" + x.depends_on : "—")}</td>
         <td>${statusChip(x.status)}</td>
         <td class="mono">${x.latency_ms == null ? "—" : x.latency_ms + " ms"}${x.latency_class ? ` <span class="text-muted">(${x.latency_class})</span>` : ""}</td>
         <td class="mono">${x.packet_loss_pct == null ? "—" : x.packet_loss_pct + "%"}</td>
         <td class="mono" style="color:var(--color-neutral-600)">${x.last_checked ? clock(x.last_checked) : "—"}</td>
       </tr>`).join(""));
  }

  function openRegisterDialog() {
    const s = suggestedDevice || {};
    const opt = (o, sel) => `<option value="${o}" ${sel === o ? "selected" : ""}>${esc(o)}</option>`;
    const depOpts = depOptions.map((o) =>
      `<option value="${o.id}" ${s.depends_on === o.id ? "selected" : ""}>${esc(o.name)} &mdash; ${esc(o.ip_address)} (${esc(o.role)})</option>`).join("");
    const root = document.getElementById("dialog-root");
    root.innerHTML =
      `<div class="dialog-backdrop" id="dlg-back">
        <div class="dialog blueprint" style="width:min(460px,100%);background:var(--color-bg);padding:22px">
          <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
          <div class="card-kicker">Device management</div>
          <div class="dialog-title">Register device</div>
          <div id="dlg-errors"></div>
          <div class="text-muted" style="font-size:12px">Pre-filled with the next free name and address &mdash; edit as needed.</div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
            <div class="field" style="grid-column:span 2"><label>Device name</label>
              <input class="input" id="f-name" value="${esc(s.name || "")}" placeholder="e.g. PC-04"></div>
            <div class="field"><label>IP address</label>
              <input class="input" id="f-ip" value="${esc(s.ip_address || "")}" placeholder="e.g. 192.168.1.13"></div>
            <div class="field"><label>Device type</label>
              <select class="input" id="f-type">${["Computer", "Router", "Server", "Printer"].map((o) => opt(o, s.device_type || "Computer")).join("")}</select>
            </div>
            <div class="field" style="grid-column:span 2"><label>Network role</label>
              <select class="input" id="f-role">${["Client", "Gateway", "Service", "Peripheral"].map((o) => opt(o, s.role || "Client")).join("")}</select>
            </div>
            <div class="field" style="grid-column:span 2"><label>Depends on (shared dependency)</label>
              <select class="input" id="f-dep"><option value="">None</option>${depOpts}</select>
            </div>
          </div>
          <div class="dialog-body text-muted" style="font-size:12px">
            The dependency link is what lets the diagnosis engine collapse several device symptoms into one shared root cause.
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" id="dlg-cancel">Cancel</button>
            <button class="btn btn-primary" id="dlg-save">Save device</button>
          </div>
        </div>
      </div>`;
    const close = () => { root.innerHTML = ""; };
    document.getElementById("dlg-back").addEventListener("click", (e) => { if (e.target.id === "dlg-back") close(); });
    document.getElementById("dlg-cancel").addEventListener("click", close);
    const showErrors = (errs) => set("dlg-errors",
      `<div style="border-left:3px solid var(--color-neutral-900);background:var(--color-neutral-200);padding:8px 12px;font-size:12px">
         Could not save:<br>${errs.map(esc).join("<br>")}</div>`);

    document.getElementById("dlg-save").addEventListener("click", async () => {
      const payload = {
        name: document.getElementById("f-name").value.trim(),
        ip_address: document.getElementById("f-ip").value.trim(),
        device_type: document.getElementById("f-type").value,
        role: document.getElementById("f-role").value,
      };
      const dep = document.getElementById("f-dep").value;
      if (dep) payload.depends_on = Number(dep);

      const local = [];
      if (!payload.name) local.push("name is required");
      if (!payload.ip_address) local.push("IP address is required");
      if (local.length) { showErrors(local); return; }

      const btn = document.getElementById("dlg-save");
      btn.disabled = true;
      try {
        const created = await api("/api/devices", { method: "POST", body: JSON.stringify(payload) });
        close();
        flash(`Registered ${created.name}`);
        renderDevices();
      } catch (err) {
        btn.disabled = false;
        showErrors((err.body && err.body.errors) || [err.message]);
      }
    });
  }

  // ---- diagnosis ---------------------------------------------------
  async function renderDiagnosisPage() {
    const d = await api("/api/diagnosis");
    set("rootcause-body",
      `<div style="font-family:var(--font-heading);font-weight:600;font-size:40px;line-height:1.02">${esc(d.root_cause)}</div>
       <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px">
         ${priorityChip(d.priority)}
         <span class="st st-warn">Confidence ${d.confidence}%</span>
         <span class="mono" style="color:var(--color-neutral-600)">rule: ${esc(d.rule_name)}</span>
       </div>
       <p class="text-muted" style="font-size:13px;margin:8px 0 0">${esc(d.reasoning)}</p>`);

    set("evidence-body",
      (d.evidence || []).map((e) =>
        `<div style="display:flex;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--color-divider)">
           <span class="tick">✓</span>
           <div style="flex:1"><div style="font-size:14px">${esc(e.text)}</div>
             <div class="mono" style="color:var(--color-neutral-600)">${esc(e.detail)}</div></div>
           <span class="mono">${esc(e.score)}</span>
         </div>`).join("") +
      `<div style="display:flex;justify-content:flex-end;gap:10px;font-family:var(--font-heading);text-transform:uppercase;margin-top:8px">
         Total <span class="mono">${d.confidence}</span></div>`);

    const hyps = d.hypotheses || [];
    const max = Math.max(1, ...hyps.map((h) => h.score));
    set("hypotheses-body", hyps.map((h, i) =>
      `<div class="hyp-row">
         <span class="nm">${esc(h.label)}</span>
         <div class="hyp-bar ${i === 0 && h.score > 0 ? "top" : ""}"><i style="width:${Math.round(h.score / max * 100)}%"></i></div>
         <span class="mono sc">${h.score}</span>
       </div>`).join(""));

    set("affected-body", (d.affected && d.affected.length)
      ? d.affected.map((a) =>
        `<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px dotted var(--color-divider)">
           <span style="font-family:var(--font-heading);font-size:16px">${esc(a.name)}</span>
           <span class="mono" style="color:var(--color-neutral-600)">${esc(a.reason)}</span>
         </div>`).join("")
      : `<div class="text-muted" style="font-size:13px">No devices currently affected.</div>`);

    set("actions-body", (d.actions || []).map((a, i) =>
      `<div style="display:flex;gap:10px;font-size:14px;align-items:baseline">
         <span class="mono" style="color:var(--color-accent-700)">${i + 1}.</span><span>${esc(a)}</span>
       </div>`).join(""));
  }

  // ---- incidents --------------------------------------------------
  async function renderIncidents() {
    const d = await api("/api/incidents");
    if (!d.incidents.length) {
      set("incidents-tbody", `<tr><td colspan="9" class="text-muted" style="padding:12px 2px">No incidents recorded yet. Trigger a scenario on the Simulation page.</td></tr>`);
      return;
    }
    set("incidents-tbody", d.incidents.map((i) =>
      `<tr>
         <td class="mono">${esc(i.code)}</td>
         <td>${esc(i.root_cause)}</td>
         <td>${priorityChip(i.priority)}</td>
         <td>${statusChip(i.status)}</td>
         <td class="mono">${esc((i.affected || []).join(", ") || "—")}</td>
         <td class="mono">${clock(i.started_at)}</td>
         <td class="mono">${i.resolved_at ? clock(i.resolved_at) : "—"}</td>
         <td class="mono">${esc(i.duration || (i.status === "open" ? "ongoing" : "—"))}</td>
         <td style="text-align:right"><a class="btn btn-ghost" href="/incidents/${i.id}">Timeline</a></td>
       </tr>`).join(""));
  }

  async function renderIncidentDetail() {
    const id = document.body.dataset.incidentId;
    let d;
    try { d = await api(`/api/incidents/${id}`); }
    catch (e) { set("detail-body", `<div class="text-muted">Incident not found.</div>`); return; }

    const field = (label, value) =>
      `<div><div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-neutral-600)">${label}</div>
       <div class="mono">${esc(value)}</div></div>`;

    set("detail-body",
      `<div class="row" style="gap:10px">
         <span class="mono">${esc(d.code)}</span>${statusChip(d.status)}${priorityChip(d.priority)}
       </div>
       <div style="font-family:var(--font-heading);font-weight:600;font-size:34px;line-height:1.05">${esc(d.root_cause)}</div>
       <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:12px 0">
         ${field("Started", clock(d.started_at))}
         ${field("Recovered", d.resolved_at ? clock(d.resolved_at) : "—")}
         ${field("Duration", d.duration || "ongoing")}
         ${field("Confidence", d.confidence + "%")}
       </div>
       <div class="card-kicker">Affected devices</div>
       <div style="display:flex;gap:8px;flex-wrap:wrap">
         ${(d.affected_devices || []).map((x) => `<span class="st st-warn">${esc(x.name)}</span>`).join("") || "<span class='text-muted'>none</span>"}
       </div>`);

    const tl = d.timeline || [];
    set("detail-timeline", tl.map((t, i) =>
      `<div class="timeline-row ${i === tl.length - 1 ? "last" : ""}">
         <span class="mono t">${clock(t.timestamp)}</span>
         <div class="rail"><div class="dot"></div><div class="line"></div></div>
         <div class="tx"><span class="mono" style="color:var(--color-accent-700)">${esc(t.rule_name)}</span> &mdash; ${esc(t.evidence)}</div>
       </div>`).join("") || `<div class="text-muted" style="font-size:13px">No timeline events.</div>`);
  }

  // ---- simulation ------------------------------------------------
  async function renderSimulation() {
    const d = await api("/api/simulation");
    set("sim-grid", (d.scenarios || []).map((s) => {
      const active = s.key === d.active;
      return `<button class="card blueprint simcard ${active ? "active" : ""}" data-endpoint="${esc(s.endpoint)}">
                <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
                <div class="row">
                  <span style="font-family:var(--font-heading);font-weight:600;font-size:19px;letter-spacing:.04em;text-transform:uppercase">${esc(s.label)}</span>
                  <span class="spacer"></span>
                  <span class="mono" style="font-size:11px;opacity:.7">${active ? "ACTIVE" : ""}</span>
                </div>
                <div style="font-size:13px;opacity:.8">${esc(s.note)}</div>
                <div class="mono" style="font-size:11px;opacity:.6">POST ${esc(s.endpoint)}</div>
              </button>`;
    }).join(""));
    document.querySelectorAll(".simcard").forEach((btn) => {
      btn.addEventListener("click", async () => {
        document.querySelectorAll(".simcard").forEach((b) => (b.disabled = true));
        try {
          const r = await api(btn.dataset.endpoint, { method: "POST" });
          flash(`Applied: ${r.state ? r.state.label : r.applied}`);
        } catch (e) { flash(e.message, true); }
        await Promise.all([refreshHeader(), renderSimulation()]);
      });
    });
  }

  // ---- dispatch -----------------------------------------------------
  const RENDERERS = {
    dashboard: renderDashboard,
    devices: renderDevices,
    diagnosis: renderDiagnosisPage,
    incidents: renderIncidents,
    incident_detail: renderIncidentDetail,
    simulation: renderSimulation,
  };

  async function tick() {
    await refreshHeader();
    const r = RENDERERS[page];
    if (r) {
      try { await r(); }
      catch (e) {
        console.error(e);
        flash(`Could not load ${page}: ${e.message}`, true);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (page === "devices") {
      const b = document.getElementById("btn-register");
      if (b) b.addEventListener("click", openRegisterDialog);
    }
    if (page === "simulation") {
      const rb = document.getElementById("btn-reset-data");
      if (rb) rb.addEventListener("click", async () => {
        rb.disabled = true;
        try { await api("/api/monitoring/reset-data", { method: "POST" }); flash("Demo data cleared"); }
        catch (e) { flash(e.message, true); }
        rb.disabled = false;
        await Promise.all([refreshHeader(), renderSimulation()]);
      });
    }
    tick();
    setInterval(tick, POLL_MS);
  });
})();
