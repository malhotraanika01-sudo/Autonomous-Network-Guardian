"""Aggregate dashboard endpoint (PRD 24.1, 30 step 13).

One call returns everything the dashboard header + body need, so the frontend
polls a single URL each monitoring cycle.
"""
from __future__ import annotations

from flask import Blueprint, current_app, jsonify

from ..database import models as m
from ..database.db import get_db
from ..diagnosis.engine import DiagnosisEngine
from ..diagnosis.observation import Observation
from ..incidents.health import compute_health
from ..incidents.manager import incident_code
from ..monitoring.ping_monitor import classify_latency
from . import current_engine, current_registry
from .incidents import _summary

bp = Blueprint("dashboard_api", __name__, url_prefix="/api")


def _device_view(d, latest, cfg) -> dict:
    row = latest.get(d["id"])
    lat = row["latency"] if row else None
    return {
        "id": d["id"], "name": d["name"], "ip_address": d["ip_address"],
        "device_type": d["device_type"], "role": d["role"], "status": d["status"],
        "depends_on": d["depends_on"],
        "latency_ms": lat, "latency_class": classify_latency(lat, cfg),
        "packet_loss_pct": row["packet_loss"] if row else None,
        "reachable": bool(row["reachable"]) if row else None,
        "last_checked": row["timestamp"] if row else None,
    }


@bp.get("/dashboard")
def dashboard():
    engine = current_engine()
    registry = current_registry()
    conn = get_db()
    cfg = current_app.config

    devices = m.list_devices(conn)
    latest = m.latest_measurements(conn)
    device_views = [_device_view(d, latest, cfg) for d in devices]

    # diagnosis + health: use cached values, else compute now
    if engine.latest_diagnosis is not None:
        diag = engine.latest_diagnosis.to_dict()
        health = engine.latest_health.to_dict()
    else:
        obs = Observation.from_db(conn)
        diag = DiagnosisEngine(cfg).diagnose(obs).to_dict()
        health = compute_health(obs, cfg).to_dict()

    gw = m.get_gateway(conn)
    gw_view = next((v for v in device_views if gw and v["id"] == gw["id"]), None)
    dns = m.latest_service_check(conn, "dns")
    inet = m.latest_service_check(conn, "internet")
    dns_ok = bool(dns["reachable"]) if dns else True
    inet_ok = bool(inet["reachable"]) if inet else True
    gw_ok = (gw_view["status"] in ("online", "degraded")) if gw_view else True

    shared = [
        {"name": f"Gateway {gw['name']}" if gw else "Gateway", "ok": gw_ok,
         "state": "Online" if gw_ok else "Failed"},
        {"name": "DNS resolution", "ok": dns_ok,
         "state": "Resolving" if dns_ok else "Failed"},
        {"name": "Internet / WAN", "ok": inet_ok,
         "state": "Reachable" if inet_ok else "Failed"},
    ]

    clients = [v for v in device_views if v["role"] in ("Client", "Service", "Peripheral")]
    all_incidents = m.list_incidents(conn)
    active = [_summary(conn, r) for r in all_incidents if r["status"] == "open"]
    last_resolved = next((r for r in all_incidents if r["status"] == "resolved"), None)

    return jsonify({
        "monitoring": engine.status(),
        "scenario": registry.describe(),
        "health": health,
        "devices": {
            "online": sum(1 for v in device_views if v["status"] == "online"),
            "total": len(device_views),
            "list": device_views,
        },
        "shared_dependencies": shared,
        "topology": {
            "clients": [{"name": c["name"], "status": c["status"]} for c in clients[:3]],
            "gateway": {"name": gw["name"] if gw else None, "ok": gw_ok},
            "internet": {"ok": inet_ok},
            "note": _topology_note(conn, gw),
        },
        "diagnosis": diag,
        "active_incidents": active,
        "recent_events": _recent_events(conn, engine, device_views, health),
        "last_recovery": last_resolved["duration"] if last_resolved else None,
    })


def _topology_note(conn, gw) -> str:
    if not gw:
        return ""
    deps = conn.execute(
        "SELECT name FROM devices WHERE depends_on = ? AND role = 'Client' ORDER BY name",
        (gw["id"],),
    ).fetchall()
    names = [r["name"] for r in deps]
    if not names:
        return ""
    return f"{', '.join(names)} share {gw['name']} as their only route out."


def _recent_events(conn, engine, device_views, health) -> list[dict]:
    events: list[dict] = []
    online = sum(1 for v in device_views if v["reachable"])
    total = len(device_views)
    if engine.last_cycle_at:
        events.append({"t": engine.last_cycle_at,
                       "text": f"Monitoring cycle complete — {online}/{total} reachable"})
        events.append({"t": engine.last_cycle_at,
                       "text": f"Health score {health['score']} / 100 ({health['status']})"})
    for e in m.recent_diagnostic_events(conn, 12):
        code = incident_code(e["incident_id"]) if e["incident_id"] else "—"
        events.append({"t": e["timestamp"], "text": f"{code}: {e['evidence']}"})
    return events[:14]
