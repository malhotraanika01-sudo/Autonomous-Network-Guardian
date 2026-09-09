"""Device registration and listing (PRD 5, 24.2, 26)."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..database import models as m
from ..database.db import get_db
from ..monitoring.ping_monitor import classify_latency

bp = Blueprint("devices", __name__, url_prefix="/api")

VALID_TYPES = {"Computer", "Router", "Server", "Printer"}
VALID_ROLES = {"Client", "Gateway", "Service", "Peripheral"}


def _device_payload(conn, d, latest) -> dict:
    row = latest.get(d["id"])
    latency = row["latency"] if row else None
    from flask import current_app
    return {
        "id": d["id"],
        "name": d["name"],
        "ip_address": d["ip_address"],
        "device_type": d["device_type"],
        "role": d["role"],
        "status": d["status"],
        "depends_on": d["depends_on"],
        "created_at": d["created_at"],
        "latency_ms": latency,
        "latency_class": classify_latency(latency, current_app.config),
        "packet_loss_pct": row["packet_loss"] if row else None,
        "reachable": bool(row["reachable"]) if row else None,
        "last_checked": row["timestamp"] if row else None,
    }


@bp.get("/devices")
def list_devices():
    conn = get_db()
    latest = m.latest_measurements(conn)
    devices = [_device_payload(conn, d, latest) for d in m.list_devices(conn)]
    return jsonify({
        "devices": devices,
        "online": sum(1 for d in devices if d["status"] == "online"),
        "total": len(devices),
    })


@bp.get("/devices/<int:device_id>")
def get_device(device_id: int):
    conn = get_db()
    d = m.get_device(conn, device_id)
    if d is None:
        return jsonify({"error": "device not found"}), 404
    latest = m.latest_measurements(conn)
    return jsonify(_device_payload(conn, d, latest))


@bp.post("/devices")
def create_device():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    ip = (data.get("ip_address") or "").strip()
    dtype = (data.get("device_type") or "").strip()
    role = (data.get("role") or "").strip()
    depends_on = data.get("depends_on")

    errors = []
    if not name:
        errors.append("name is required")
    if not ip:
        errors.append("ip_address is required")
    if dtype not in VALID_TYPES:
        errors.append(f"device_type must be one of {sorted(VALID_TYPES)}")
    if role not in VALID_ROLES:
        errors.append(f"role must be one of {sorted(VALID_ROLES)}")

    conn = get_db()
    if depends_on is not None:
        if m.get_device(conn, depends_on) is None:
            errors.append("depends_on must reference an existing device")
    if name and m.list_devices(conn) and any(d["name"] == name for d in m.list_devices(conn)):
        errors.append("a device with that name already exists")
    if errors:
        return jsonify({"errors": errors}), 400

    device_id = m.create_device(conn, name, ip, dtype, role, depends_on)
    conn.commit()
    d = m.get_device(conn, device_id)
    return jsonify(_device_payload(conn, d, m.latest_measurements(conn))), 201
