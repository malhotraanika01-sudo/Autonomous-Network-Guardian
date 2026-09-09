# ANG — notes for future sessions

Rule-based network monitoring + root-cause diagnosis. Flask + stdlib `sqlite3`
(no ORM) + vanilla JS frontend. Python 3.12, venv at `.venv`.

## Run / test
- App: `.venv\Scripts\python app.py` → http://127.0.0.1:5000
- Tests: `set ANG_TESTING=1 && .venv\Scripts\python -m pytest` (67 tests)
- Recreate DB: `flask --app app init-db`

## Shape
- `ang/config.py` — every threshold/weight/interval, env-overridable (`ANG_*`).
- `ang/monitoring/probes.py` — **the probe seam**. Engine → `ProbeProvider`
  (`SimulatedProbes` or `LiveProbes`). Never call the network above this line.
- `ang/monitoring/engine.py` — `run_cycle()` = probe → store → diagnose →
  health → incident sync. Background daemon thread.
- `ang/simulation/` — 8 deterministic scenarios, numbers aligned to the mockup.
- `ang/diagnosis/rules.py` — 6 pure `(Observation, config) → Hypothesis` rules;
  `engine.py` compares scores, picks one, never diagnoses from one failed test.
- `ang/incidents/manager.py` — lifecycle, anti-flap, 2-cycle recovery close,
  supersede, timeline. `health.py` — weighted 0–100 score.
- `ang/routes/` — REST blueprints + `pages.py` (HTML shells). `dashboard.py`
  has the aggregate endpoint the frontend polls.
- `ang/templates/` + `ang/static/` — `industry.css` is the mockup's design
  system, reused verbatim; `app.js` is one poller per page.

## Conventions
- Confidence numbers deliberately match the UI mockup (gateway 95, individual
  88, dns 84, internet 86, latency 72, loss 76). Don't drift them without
  updating `tests/test_phase3_diagnosis.py`.
- Schema migrations: add columns to `schema.sql` **and** to `_MIGRATIONS` in
  `ang/database/db.py`.
- Tests build config with `tests/conftest.py:config_dict()` (plain dict; works
  because everything uses `.get`/`[]`).

Full phase history: `PROGRESS.md`.
