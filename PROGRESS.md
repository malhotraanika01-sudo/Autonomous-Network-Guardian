# ANG — build progress

Phase-by-phase status. Ticked items are implemented and covered by tests.

## Decisions taken (defaults — tell me to change any)
- **Probe mode**: `simulation` is the default and the demo path. `live` mode
  (real ICMP via the system `ping`, socket DNS/WAN checks) exists but is
  best-effort and opt-in (`ANG_PROBE_MODE=live` or `POST /api/monitoring/mode`).
- **Scheduler**: a single daemon `threading` loop, off the request path. No
  APScheduler dependency.
- **Schema extension**: `devices.depends_on` (self-FK) added — required for
  dependency-aware diagnosis and the mockup's register dialog. Also added a
  `service_checks` table (DNS/internet aren't devices).
- **Auth / multi-user**: out of scope for v1 (PRD lists it as a future item).
- **Stack**: Flask + stdlib `sqlite3` (no ORM), pytest.

## Phase 0 — Scaffolding ✅
- `ang/` package, app factory, `config.py` (every PRD threshold/weight/interval).
- `database/schema.sql` — all 6 PRD tables + `depends_on` + `service_checks`.
- Seed topology: RTR-01 (gateway) + PC-01/02/03, SRV-01, PRN-01 depending on it.
- `flask init-db`, idempotent auto-init on startup.
- `GET /`, `GET /api/health`, `GET /api/devices`, `POST /api/devices`.

## Phase 1 — Monitoring core + probe seam ✅
- `ProbeProvider` interface; `LiveProbes` (ping parse, socket DNS/WAN).
- `MonitoringEngine.run_cycle()`: probe every device → store `measurements`,
  run DNS + internet checks → store `service_checks`, update device status.
- Background loop on `CYCLE_SECONDS`; `GET /api/monitoring`, `POST /api/monitoring/cycle`.
- Latency classification per PRD 7.2 table.

## Phase 2 — Simulation engine ✅
- 8 deterministic scenarios (healthy, device, gateway, dns, internet,
  high_latency, packet_loss, recovery), numbers aligned with the mockup.
- `SimulatedProbes` plugs into the same seam; `ProviderRegistry` switches modes.
- `GET /api/simulation`, `POST /api/simulation/<action>` (device-failure,
  gateway-failure, dns-failure, internet-failure, high-latency, packet-loss,
  recovery, reset).

## Phase 3 — Diagnosis engine ✅
- 6 candidate rules + healthy fallback, each a pure `(Observation, config) → Hypothesis`.
- Hypothesis comparison (PRD 34): gateway failure out-scores 3× individual-device;
  DNS failure ≠ internet failure; internet failure ≠ gateway failure.
- Confidence (capped per rule), priority (PRD 15, with scope escalation),
  affected-device resolution via the `depends_on` graph, evidence with score
  contributions, recommended actions (PRD 16), full ranked hypothesis list.
- `GET /api/diagnosis`. Confidence numbers match the mockup: gateway 95,
  individual 88, dns 84, internet 86, latency 72, loss 76.

## Phase 4 — Incident manager + health score ✅
- `IncidentManager.sync()` runs every cycle with the diagnosis + health score:
  - opens an incident on a confirmed fault (anti-flap: `FAILURE_CONFIRM_CYCLES`)
  - keeps an open incident's confidence / priority / affected devices current
    without duplicating it
  - confirms recovery over `RECOVERY_CONFIRM_CYCLES` (=2) clean cycles, then
    auto-closes with `resolved_at` + computed `duration` (PRD 19)
  - a different fault taking over supersedes the previous open incident
  - writes the `diagnostic_events` timeline (opened → evidence → confidence →
    recommendation → health → recovery_confirmed) (PRD 20)
- `incidents` / `incident_devices` / `diagnostic_events` fully populated.
  Schema migration adds `recovery_cycles`, `health_at_start`, `last_seen_at`.
- **Network health score 0–100** (`ang/incidents/health.py`): weighted sum of
  the six PRD 21.1 factors, each reporting points lost + reason. Healthy ≈ 100
  (HEALTHY), gateway failure ≈ 38 (CRITICAL, PRD 21.2 "below 40").
- API: `GET /api/incidents`, `GET /api/incidents/<id>` (with timeline),
  `GET /api/events`, and `GET /api/health` now returns the real score +
  `active_incidents`. `GET /api/health/score` for the score alone.

### Test coverage — 40 passing
`tests/test_phase0_scaffolding.py` · `test_phase1_monitoring.py` ·
`test_phase2_simulation.py` · `test_phase3_diagnosis.py` (PRD success
criteria A–F) · `test_phase4_incidents.py` (lifecycle, flap suppression,
recovery auto-close, supersede, health score).

## Next — Phase 5 (not started)
Complete the REST surface for the frontend: finalise JSON contracts for every
mockup page, add a dashboard aggregate endpoint (health + devices + diagnosis +
active incidents + recent events in one call), device dependency options for
the register dialog. Then Phase 6: port the mockup to Flask templates + JS.

---
## Run it
```
python -m venv .venv && .venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python app.py            # http://127.0.0.1:5000
.venv\Scripts\python -m pytest         # tests  (set ANG_TESTING=1)
```
