PRODUCT REQUIREMENTS DOCUMENT

Autonomous Network Guardian (ANG)

A Rule-Based Autonomous Network Monitoring & Root-Cause Diagnosis Platform

Version 1.0

Prepared: September 8, 2026

Document Type: Product Requirements Document (PRD)

# Table of Contents

1. Project Overview

2. Goals and Objectives

3. Target Users

4. Key Product Concept

5. Core Features

6. Network Monitoring

7. Connectivity Monitoring

8. Gateway Monitoring

9. DNS Monitoring

## 10. Internet Connectivity Monitoring

## 11. Diagnosis Engine

## 12. Dependency-Aware Diagnosis

## 13. Diagnosis Evidence

## 14. Confidence Scoring

## 15. Priority System

## 16. Recommended Troubleshooting Action

## 17. Incident Management

## 18. Incident Lifecycle

## 19. Automatic Recovery Detection

## 20. Incident Timeline

## 21. Network Health Score

## 22. Simulation Mode

## 23. Demonstration Workflow

## 24. Frontend Requirements

## 25. Backend Requirements

## 26. REST API

## 27. Database Requirements

## 28. Recommended Software Architecture

## 29. High-Level System Architecture

## 30. End-to-End Workflow

## 31. Example Full Failure Flow

## 32. Technology Stack

## 33. Non-Functional Requirements

## 34. Important Design Principle

## 35. What Makes the Project Different

## 36. Project Scope

## 37. Success Criteria

## 38. Final Product Definition

# 1. Project Overview

Project Name: Autonomous Network Guardian (ANG)

Project Type: Network Monitoring, Fault Diagnosis, and Incident Management System

Target Environment: Small college laboratories, classrooms, offices, and other small local networks.

## 1.1 Problem Statement

Traditional network monitoring systems often report isolated symptoms such as:

PC1 is offline

PC2 is offline

Internet unavailable

DNS unavailable

These alerts do not necessarily identify the actual cause of the problem.

For example, if three computers lose internet access because their shared gateway/router has failed, a conventional monitoring system may report three separate device failures. Autonomous Network Guardian instead analyzes the relationship between devices and shared network dependencies to identify the most probable common root cause.

## 1.2 Product Vision

Autonomous Network Guardian will continuously monitor network devices and services, collect connectivity and performance measurements, correlate observations, identify the most probable root cause of network faults, identify affected devices, calculate a confidence level and priority, recommend troubleshooting actions, and maintain an incident timeline through recovery.

## 1.3 Core Value Proposition

Detect the fault, identify the probable shared root cause, show the affected devices, explain the evidence, and recommend what to do next.

# 2. Goals and Objectives

## 2.1 Primary Goals

Monitor registered network devices continuously.

Measure device availability, latency, and packet loss.

Monitor gateway availability.

Check DNS resolution.

Check external/internet connectivity.

Detect individual and shared network failures.

Correlate multiple observations to identify probable root causes.

Display affected devices.

Provide a confidence score for the diagnosis.

Assign incident priority.

Recommend troubleshooting actions.

Calculate an overall network health score from 0 to 100.

Maintain an incident timeline.

Automatically detect recovery and close incidents.

Provide simulation mode for predictable demonstrations.

## 2.2 Secondary Goals

Keep the system simple enough for a college project.

Use transparent rule-based diagnosis rather than opaque AI/ML.

Make the dashboard easy to understand.

Keep the architecture modular so future features can be added.

# 3. Target Users

## 3.1 Primary User — Network Administrator / Lab Administrator

Responsibilities:

Register devices.

Configure monitoring targets.

View network health.

Investigate active incidents.

Follow recommended troubleshooting actions.

Review incident history.

Run simulations during demonstrations.

## 3.2 Secondary User — Student / Demonstrator

Can:

View dashboard status.

Trigger simulation scenarios.

Demonstrate root-cause diagnosis.

Observe incident creation and recovery.

# 4. Key Product Concept

Autonomous Network Guardian operates at three logical levels.

## Level 1 — Observation

The system collects:

Device availability

Ping response

Network latency

Packet loss

Gateway status

DNS status

Internet connectivity

## Level 2 — Reasoning

The diagnosis engine correlates observations and evaluates possible causes.

## Level 3 — Actionable Output

The system produces:

Probable root cause

Affected devices

Confidence level

Priority

Evidence

Recommended action

Incident timeline

# 5. Core Features

## 5.1 Device Management

The administrator can register network devices.

### Device Information

Each device should support:

Device name

IP address

Device type

Network role

Current status

Creation timestamp

### Example

# 6. Network Monitoring

The monitoring engine periodically tests registered devices and network services.

## 6.1 Monitoring Cycle

Example monitoring interval:

The exact interval should be configurable.

# 7. Connectivity Monitoring

## 7.1 Ping Test

The system sends an ICMP Echo Request and waits for an Echo Reply.

Result: reachable = TRUE, or reachable = FALSE.

## 7.2 Latency Measurement

Latency is measured using the round-trip response time.

Example project thresholds:

Thresholds should remain configurable.

## 7.3 Packet Loss

Packet loss should be stored as a percentage.

# 8. Gateway Monitoring

The gateway is a critical shared dependency.

The monitoring engine periodically checks whether the gateway is reachable.

A gateway failure combined with failures across multiple clients is strong evidence for a shared infrastructure fault.

# 9. DNS Monitoring

DNS monitoring distinguishes DNS failures from general internet failures.

Diagnosis:

This prevents the system from incorrectly labeling every DNS problem as an internet outage.

# 10. Internet Connectivity Monitoring

The system should test external connectivity using a reliable external endpoint or controlled test target.

The purpose is to distinguish:

Local network failure

Gateway failure

DNS failure

WAN/internet failure

# 11. Diagnosis Engine

The diagnosis engine is the core reasoning component. It receives monitoring observations and compares possible fault hypotheses.

## 11.1 Candidate Diagnoses

The first version should support:

Individual device failure

Gateway/router failure

DNS failure

Internet/WAN failure

High latency

Packet loss

Shared network congestion/degradation

Healthy network / no fault

## 11.2 Rule-Based Approach

The system should use explicit rules rather than complex machine learning.

# 12. Dependency-Aware Diagnosis

This is the primary innovation of the system.

Example topology:

The gateway is a shared dependency. If it fails:

The system should convert multiple symptoms into one probable root cause. Instead of:

the dashboard should show:

# 13. Diagnosis Evidence

Every diagnosis should be explainable.

The evidence should be generated from actual measurements or simulation state.

# 14. Confidence Scoring

The diagnosis engine should calculate a confidence score based on supporting evidence.

Example conceptual scoring:

The implementation can normalize or cap the final result. Example: Confidence: 95%.

The confidence percentage is a project-defined diagnostic score, not a statistical guarantee.

# 15. Priority System

Incidents should receive priorities based on severity and scope. Suggested levels:

### Critical

Gateway failure

Multiple devices simultaneously affected

Complete internet outage

### High

Major packet loss

Severe latency

Important server unavailable

### Medium

Individual device failure

Moderate packet loss

### Low

Minor latency degradation

Non-critical peripheral issue

# 16. Recommended Troubleshooting Action

Every major diagnosis should have a recommended response.

## Gateway Failure

Check router power.

Check Ethernet cables.

Verify gateway configuration.

Check router interface status.

## DNS Failure

Check DNS server configuration.

Check DNS service availability.

Try an alternate DNS resolver.

## Internet/WAN Failure

Check WAN connection.

Check router external interface.

Check ISP connectivity/status.

## Individual Device Failure

Check device power.

Check network cable/Wi-Fi.

Check local network configuration.

Check network adapter.

## High Latency / Packet Loss

Check network congestion.

Inspect cables and interfaces.

Check gateway performance.

Investigate overloaded devices or links.

# 17. Incident Management

A detected fault should create an incident.

# 18. Incident Lifecycle

# 19. Automatic Recovery Detection

When the failed component becomes healthy again, the system should detect recovery.

If the associated network symptoms recover, the incident can automatically be marked as resolved.

# 20. Incident Timeline

The system should retain historical events.

The timeline allows users to understand both the current state and what happened previously.

# 21. Network Health Score

The dashboard should provide an overall network health score from 0 to 100.

## 21.1 Suggested Factors

The exact scoring formula should be configurable.

## 21.2 Example

If all components are healthy: Health Score ≈ 95–100. During a major gateway failure: Health Score may fall below 40.

The dashboard should show the reasons for significant score reductions.

# 22. Simulation Mode

Simulation Mode is essential for reliable project demonstrations.

The system should allow controlled fault scenarios without requiring actual network failures.

## Supported Simulations

Individual computer failure

Gateway failure

DNS failure

Internet failure

High latency

Packet loss

Network recovery

Example interface:

# 23. Demonstration Workflow

## Scenario 1 — Healthy Network

Initial state:

Dashboard:

## Scenario 2 — Gateway Failure

Simulation: Gateway Failure. Monitoring detects:

Diagnosis:

Recommendation:

## Scenario 3 — DNS Failure

Simulation: DNS Failure. Observed:

Diagnosis:

## Scenario 4 — Recovery

Simulation: Recovery. The monitoring engine detects that connectivity has returned. The incident is closed automatically and recovery duration is displayed.

# 24. Frontend Requirements

The frontend should be implemented using HTML, CSS, and JavaScript.

## 24.1 Dashboard

The dashboard should show:

Overall network health score

Network status

Online/offline device count

Gateway status

DNS status

Internet status

Active incidents

Recent diagnosis

Recent events

## 24.2 Devices Page

Should display:

Device name

IP address

Type

Role

Status

Latest latency

Packet loss

Last checked time

## 24.3 Diagnosis Page

Should display:

Probable root cause

Confidence

Evidence

Affected devices

Priority

Recommended action

## 24.4 Incidents Page

Should display:

Incident ID

Root cause

Priority

Status

Affected devices

Start time

Recovery time

Duration

## 24.5 Simulation Page

Should allow the user to trigger supported failure scenarios.

# 25. Backend Requirements

Flask will act as the web server and application/API layer. Conceptual flow:

# 26. REST API

Suggested endpoints:

The frontend should communicate with Flask through HTTP/JSON rather than directly accessing the database.

# 27. Database Requirements

SQLite should store persistent application data.

## 27.1 Devices Table

## 27.2 Measurements Table

## 27.3 Incidents Table

## 27.4 Incident Devices Table

This represents which devices were affected by an incident.

## 27.5 Diagnostic Events Table

This can preserve the reasoning evidence behind a diagnosis.

# 28. Recommended Software Architecture

A modular project structure is recommended.

# 29. High-Level System Architecture

# 30. End-to-End Workflow

## Step 1 — User Opens Dashboard

Browser requests the Flask application (GET /). Flask loads the latest network state and displays it.

## Step 2 — Devices Are Registered

Administrator enters device information (Name, IP, Type, Role). The information is stored in SQLite.

## Step 3 — Monitoring Starts

The monitoring engine periodically checks all configured devices.

## Step 4 — Network Measurements Are Collected

For each target: Reachability, Latency, Packet Loss. Additional checks are performed for: Gateway, DNS, Internet.

## Step 5 — Measurements Are Stored

Each observation receives a timestamp and is stored in the database.

## Step 6 — Diagnosis Engine Evaluates State

The diagnosis engine receives the latest observations and evaluates fault rules.

## Step 7 — Root Cause Is Selected

The engine compares candidate explanations and selects the most strongly supported diagnosis.

## Step 8 — Confidence Is Calculated

Supporting evidence is converted into a confidence score.

## Step 9 — Affected Devices Are Identified

The system determines which devices are directly or indirectly affected.

## Step 10 — Incident Is Created

If the problem meets the incident threshold, an incident is created and stored.

## Step 11 — Recommendation Is Generated

The diagnosis rule provides a troubleshooting action.

## Step 12 — Health Score Is Updated

The network health score is recalculated.

## Step 13 — Dashboard Updates

JavaScript retrieves current information from Flask APIs and updates the UI.

## Step 14 — Recovery Is Detected

The monitoring engine notices when the failed condition returns to normal.

## Step 15 — Incident Is Closed

The system records: Recovery timestamp, Incident duration, Resolved status.

## Step 16 — Historical Timeline Is Preserved

The complete event remains available for later inspection.

# 31. Example Full Failure Flow

# 32. Technology Stack

## Frontend

### HTML

Used for: Dashboard structure, Tables, Cards, Forms, Navigation, Incident views.

### CSS

Used for: Layout, Status indicators, Dashboard cards, Tables, Responsive design, Health score visualization.

### JavaScript

Used for: API requests, Automatic dashboard updates, Simulation controls, Dynamic status changes, Rendering current monitoring data.

## Backend

### Python

Used for: Monitoring logic, Network tests, Diagnosis rules, Health scoring, Incident management, Simulation, Database operations.

### Flask

Used for: Web server, HTTP routes, REST API, Connecting frontend with backend logic.

## Networking

### Ping / ICMP

Used for: Reachability, Latency, Basic packet-loss measurements.

### Python Socket / DNS Functionality

Used for: Connectivity checks, DNS resolution, Network service testing.

## Database

### SQLite

Used for: Device records, Measurements, Incidents, Diagnostic events, Historical timelines.

# 33. Non-Functional Requirements

## Performance

Monitoring should run periodically without blocking the web interface.

Dashboard API responses should be fast for the expected small network size.

Monitoring tasks should be isolated from normal HTTP request processing where practical.

## Reliability

Temporary test failures should not immediately create repeated duplicate incidents.

Recovery should be confirmed before closing an incident.

Simulation mode should produce deterministic results.

## Usability

Network state should be understandable at a glance.

Critical problems should be visually prominent.

Diagnosis should show evidence rather than only a label.

## Maintainability

Monitoring, diagnosis, incident management, simulation, and database code should remain modular.

Diagnosis rules should be easy to add or modify.

## Explainability

Every diagnosis should be traceable to observable evidence.

# 34. Important Design Principle

The diagnosis engine should not blindly declare a root cause from one failed test. It should compare multiple hypotheses.

For example:

is stronger evidence for a gateway/shared-network problem than:

which strongly suggests an individual PC problem. Similarly:

should point toward DNS rather than general internet failure.

# 35. What Makes the Project Different

Many basic student network monitoring projects stop at:

Autonomous Network Guardian extends this into:

The key contribution is:

Converting multiple network symptoms into one evidence-based probable root cause whenever a shared dependency explains the observed failures.

# 36. Project Scope

## Included in First Version

Device registration

Device monitoring

Ping tests

Latency measurement

Packet-loss measurement

Gateway monitoring

DNS monitoring

Internet connectivity monitoring

Rule-based diagnosis

Confidence scoring

Priority classification

Affected device identification

Recommendations

Health score

Incident creation

Incident history

Recovery detection

Simulation mode

Web dashboard

## Future Extensions

The architecture can later support:

Automatic recovery actions

Email/SMS/mobile notifications

Machine-learning-based anomaly detection

Predictive failure detection

Larger enterprise networks

Network topology discovery

SNMP monitoring

Router/switch telemetry

Historical analytics

User authentication and roles

Distributed monitoring agents

# 37. Success Criteria

The project will be considered successful if it can reliably demonstrate the following:

## Scenario A — Healthy Network

System displays: Healthy, High Health Score, No Active Incidents.

## Scenario B — Individual Device Failure

System identifies: Individual Device Failure — without incorrectly blaming the gateway.

## Scenario C — Gateway Failure

System identifies: Gateway Failure — and lists multiple affected devices.

## Scenario D — DNS Failure

System distinguishes: DNS Failure — from general internet failure.

## Scenario E — Internet Failure

System distinguishes external/WAN failure from local gateway failure where the observations permit that distinction.

## Scenario F — Recovery

System automatically:

Detects recovery

Closes incident

Records recovery time

Calculates incident duration

Updates health score

# 38. Final Product Definition

Autonomous Network Guardian is a rule-based autonomous network monitoring and fault-diagnosis platform for small networks.

Its complete pipeline is:

The central architectural idea is:

This is what transforms the project from a simple "ping monitor" into a network fault-diagnosis system.

| PC1 failed PC2 failed PC3 failed Gateway failed Internet failed           ↓   Multiple devices share the same gateway           ↓   Gateway is a common dependency           ↓   Probable Root Cause: Gateway Failure |
| --- |

| Device | IP | Type | Role |
| --- | --- | --- | --- |
| PC-01 | 192.168.1.10 | Computer | Client |
| PC-02 | 192.168.1.11 | Computer | Client |
| PC-03 | 192.168.1.12 | Computer | Client |
| Router | 192.168.1.1 | Router | Gateway |
| Server | 192.168.1.20 | Server | Service |
| Printer | 192.168.1.30 | Printer | Peripheral |

| Every 10 seconds           ↓   Check PC1 Check PC2 Check PC3 Check Gateway Check DNS Check Internet           ↓   Store measurements           ↓   Run diagnosis           ↓   Update dashboard |
| --- |

| Guardian     |     | ICMP Echo Request     ↓  Device     |     | ICMP Echo Reply     ↓ Guardian |
| --- |

| Request sent: 10:00:00.000 Response:     10:00:00.025   Latency ≈ 25 ms |
| --- |

| Range | Classification |
| --- | --- |
| 0–50 ms | Good |
| 50–100 ms | Moderate |
| 100–200 ms | High |
| >200 ms | Critical |

| 10 requests sent 7 responses received 3 packets lost   Packet Loss = 30% |
| --- |

| PC1 ──┐ PC2 ──┼── Router/Gateway ── Internet PC3 ──┘ |
| --- |

| Gateway        → Reachable Public IP      → Reachable DNS Resolution → Failed |
| --- |

| Probable Root Cause: DNS Failure |
| --- |

| Gateway = OK Local Devices = OK External Connectivity = FAILED           ↓   Probable Cause: Internet/WAN Failure |
| --- |

| IF multiple devices are unreachable AND gateway is unreachable   THEN probable root cause = Gateway Failure |
| --- |

| IF gateway is reachable AND external connectivity works AND DNS resolution fails   THEN probable root cause = DNS Failure |
| --- |

| IF only one device is unreachable AND gateway is reachable AND other devices are healthy   THEN probable root cause = Individual Device Failure |
| --- |

| Internet                     |                  Gateway                 /   |   \              PC1  PC2  PC3 |
| --- |

| Gateway Failure        |        +---- PC1 affected        +---- PC2 affected        +---- PC3 affected |
| --- |

| PC1 Offline PC2 Offline PC3 Offline |
| --- |

| Probable Root Cause: Gateway Failure   Affected Devices: PC1 PC2 PC3 |
| --- |

| Probable Root Cause: Gateway Failure   Confidence: 95%   Evidence: ✓ Multiple devices affected ✓ Gateway unreachable ✓ External connectivity unavailable ✓ Failures occurred within the same monitoring period |
| --- |

| Evidence Factor | Score Contribution |
| --- | --- |
| Multiple devices affected | +30 |
| Gateway unreachable | +40 |
| Internet unavailable | +20 |
| DNS unavailable | +10 |
| Total | 100 |

| Incident ID: INC-001   Root Cause: Gateway Failure   Affected: PC1, PC2, PC3   Confidence: 95%   Priority: Critical   Status: OPEN |
| --- |

| HEALTHY    ↓ ANOMALY DETECTED    ↓ DIAGNOSING    ↓ INCIDENT CREATED    ↓ ROOT CAUSE IDENTIFIED    ↓ MONITORING    ↓ RECOVERY DETECTED    ↓ INCIDENT CLOSED |
| --- |

| Gateway ❌    ↓ Gateway ❌    ↓ Gateway ❌    ↓ Gateway ✅ |
| --- |

| Incident: Gateway Failure   Started: 10:32:15   Recovered: 10:35:42   Duration: 3m 27s   Status: RESOLVED |
| --- |

| 10:30 — Network Healthy 10:32 — Gateway Failure Detected 10:32 — PC1, PC2, PC3 Affected 10:32 — Diagnosis Generated 10:32 — Recommendation Generated 10:35 — Gateway Recovered 10:35 — Incident Closed |
| --- |

| Network Health: 92 / 100   Status: HEALTHY |
| --- |

| Factor | Example Weight |
| --- | --- |
| Device Availability | 25% |
| Latency | 15% |
| Packet Loss | 15% |
| Gateway Health | 20% |
| DNS Health | 10% |
| Internet Connectivity | 15% |
| Total | 100% |

| SIMULATION MODE   [ Individual Device Failure ]   [ Gateway Failure ]   [ DNS Failure ]   [ Internet Failure ]   [ High Latency ]   [ Packet Loss ]   [ Recovery ] |
| --- |

| PC1      ONLINE PC2      ONLINE PC3      ONLINE Gateway  ONLINE DNS      ONLINE Internet ONLINE |
| --- |

| Network Health: 98/100 Status: HEALTHY Active Incidents: 0 |
| --- |

| PC1      FAILED PC2      FAILED PC3      FAILED Gateway  FAILED Internet FAILED |
| --- |

| Probable Root Cause: Gateway Failure   Affected: PC1, PC2, PC3   Priority: Critical   Confidence: High |
| --- |

| Check router power, cables, and gateway configuration. |
| --- |

| Gateway        OK External IP    OK DNS Resolution FAILED |
| --- |

| Probable Root Cause: DNS Failure |
| --- |

| AUTONOMOUS NETWORK GUARDIAN   NETWORK HEALTH 98 / 100 HEALTHY   DEVICES 5 / 5 ONLINE   GATEWAY ONLINE   DNS ONLINE   INTERNET ONLINE   ACTIVE INCIDENTS 0 |
| --- |

| Browser    ↓ HTTP Flask    ↓ Application Logic    ↓ Monitoring / Diagnosis / Incident Modules    ↓ SQLite |
| --- |

| GET    /api/devices POST   /api/devices   GET    /api/health   GET    /api/incidents GET    /api/incidents/<id>   GET    /api/diagnosis   POST   /api/simulation/device-failure POST   /api/simulation/gateway-failure POST   /api/simulation/dns-failure POST   /api/simulation/internet-failure POST   /api/simulation/high-latency POST   /api/simulation/packet-loss POST   /api/simulation/recovery |
| --- |

| devices ---------------- id name ip_address device_type role status created_at |
| --- |

| measurements ---------------- id device_id timestamp reachable latency packet_loss |
| --- |

| incidents ---------------- id root_cause confidence priority status started_at resolved_at duration |
| --- |

| incident_devices ---------------- incident_id device_id |
| --- |

| diagnostic_events ---------------- id incident_id rule_name evidence timestamp |
| --- |

| project/ │ ├── app.py │ ├── routes/ │   ├── dashboard.py │   ├── devices.py │   ├── incidents.py │   └── simulation.py │ ├── monitoring/ │   ├── ping_monitor.py │   ├── dns_monitor.py │   ├── gateway_monitor.py │   └── internet_monitor.py │ ├── diagnosis/ │   ├── rules.py │   ├── engine.py │   └── scoring.py │ ├── incidents/ │   └── manager.py │ ├── database/ │   ├── models.py │   └── db.py │ ├── simulation/ │   └── simulator.py │ ├── templates/ │   ├── dashboard.html │   ├── devices.html │   ├── incidents.html │   └── simulation.html │ ├── static/ │   ├── css/ │   └── js/ │ └── database.sqlite |
| --- |

| USER                            │                            ↓                ┌─────────────────────┐                │    WEB DASHBOARD    │                │    HTML/CSS/JS      │                └──────────┬──────────┘                           │                      HTTP / REST                           │                           ↓                ┌─────────────────────┐                │    FLASK SERVER     │                │     Routes / API    │                └──────────┬──────────┘                           │            ┌──────────────┼──────────────┐            │              │              │            ↓              ↓              ↓     ┌────────────┐ ┌────────────┐ ┌────────────┐     │ Monitoring │ │ Diagnosis  │ │ Incident   │     │ Engine     │ │ Engine     │ │ Manager    │     └─────┬──────┘ └─────┬──────┘ └─────┬──────┘           │              │              │           └──────────────┼──────────────┘                          ↓               ┌─────────────────────┐               │   NETWORK TEST      │               │      LAYER          │               │                     │               │ Ping                │               │ Latency             │               │ Packet Loss         │               │ DNS                 │               │ Gateway             │               │ Internet            │               └──────────┬──────────┘                          │                          ↓               ┌─────────────────────┐               │       NETWORK       │               │                     │               │ PC1 ──┐             │               │ PC2 ──┼─ Switch     │               │ PC3 ──┘     │       │               │             ↓       │               │          Gateway    │               │             │       │               │          Internet   │               └─────────────────────┘                            ↕                 ┌──────────────────┐                 │      SQLite      │                 │                  │                 │ Devices          │                 │ Measurements     │                 │ Incidents        │                 │ Diagnostics      │                 │ Timeline         │                 └──────────────────┘                            ↑                          │                 ┌──────────────────┐                 │ Simulation Engine│                 │                  │                 │ Device Failure   │                 │ Gateway Failure  │                 │ DNS Failure      │                 │ Internet Failure │                 │ High Latency     │                 │ Packet Loss      │                 │ Recovery         │                 └──────────────────┘ |
| --- |

| NORMAL NETWORK                        │                        ↓              Health = 98 / 100                        │                        ↓               Gateway Fails                        │                        ↓               Monitoring Engine                        │          ┌─────────────┼─────────────┐          ↓             ↓             ↓        PC1 ❌         PC2 ❌         PC3 ❌                        │                     Gateway ❌                        │                     Internet ❌                        ↓               Diagnosis Engine                        │                        ↓             Shared Dependency Found                        │                        ↓              Gateway Failure                        │            ┌───────────┼───────────┐            ↓           ↓           ↓        Root Cause   Affected    Confidence                     Devices            │           │           │            └───────────┼───────────┘                        ↓                 Incident Created                        │                        ↓                  Priority = CRITICAL                        │                        ↓               Recommendation Shown                        │                        ↓               Health Score Drops                        │                        ↓                 Gateway Recovers                        │                        ↓               Monitoring Confirms                        │                        ↓                Incident Resolved                        │                        ↓               Recovery Time Stored |
| --- |

| Gateway ❌ PC1 ❌ PC2 ❌ PC3 ❌ Internet ❌ |
| --- |

| PC1 ❌ Gateway ✅ PC2 ✅ PC3 ✅ |
| --- |

| Gateway ✅ Internet IP ✅ DNS ❌ |
| --- |

| Device Online / Offline |
| --- |

| Monitoring     ↓ Correlation     ↓ Root Cause Diagnosis     ↓ Affected Device Identification     ↓ Confidence     ↓ Priority     ↓ Recommended Action     ↓ Incident Tracking     ↓ Recovery Detection |
| --- |

| NETWORK    ↓ MONITORING    ↓ MEASUREMENTS    ↓ OBSERVATIONS    ↓ CORRELATION    ↓ DIAGNOSIS    ↓ ROOT CAUSE    ↓ AFFECTED DEVICES    ↓ CONFIDENCE + PRIORITY    ↓ RECOMMENDATION    ↓ INCIDENT    ↓ RECOVERY    ↓ HISTORICAL TIMELINE |
| --- |

| MANY SYMPTOMS                     ↓             CORRELATION ENGINE                     ↓              COMMON DEPENDENCY                     ↓               ROOT CAUSE                     ↓              ACTIONABLE OUTPUT |
| --- |
