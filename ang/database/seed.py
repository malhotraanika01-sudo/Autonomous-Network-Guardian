"""Seed the topology from the PRD example (section 5 / 38) and the mockup.

    PC-01, PC-02, PC-03  -> depend on RTR-01 (their only route out)
    RTR-01               -> the gateway (no dependency)
    SRV-01               -> service host behind the gateway
    PRN-01               -> peripheral behind the gateway
"""
from __future__ import annotations

import sqlite3

# name, ip, type, role, depends_on-name
SEED_DEVICES = [
    ("RTR-01", "192.168.1.1", "Router", "Gateway", None),
    ("PC-01", "192.168.1.10", "Computer", "Client", "RTR-01"),
    ("PC-02", "192.168.1.11", "Computer", "Client", "RTR-01"),
    ("PC-03", "192.168.1.12", "Computer", "Client", "RTR-01"),
    ("SRV-01", "192.168.1.20", "Server", "Service", "RTR-01"),
    ("PRN-01", "192.168.1.30", "Printer", "Peripheral", "RTR-01"),
]


def seed_devices(conn: sqlite3.Connection) -> None:
    """Insert the seed devices if the table is empty. Safe to call repeatedly."""
    existing = conn.execute("SELECT COUNT(*) AS n FROM devices").fetchone()["n"]
    if existing:
        return

    ids: dict[str, int] = {}
    for name, ip, dtype, role, _dep in SEED_DEVICES:
        cur = conn.execute(
            "INSERT INTO devices (name, ip_address, device_type, role, status) "
            "VALUES (?, ?, ?, ?, 'unknown')",
            (name, ip, dtype, role),
        )
        ids[name] = cur.lastrowid

    for name, _ip, _dtype, _role, dep in SEED_DEVICES:
        if dep:
            conn.execute(
                "UPDATE devices SET depends_on = ? WHERE id = ?",
                (ids[dep], ids[name]),
            )
