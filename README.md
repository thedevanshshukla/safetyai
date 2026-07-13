# SafetyAI v2.0 - AI-Powered Industrial Safety Intelligence

SafetyAI v2.0 is a cinematic, multi-agent industrial safety command center prototype. It acts as an intelligence layer on top of industrial telemetry systems (like SCADA and IoT sensors) to predict hazardous events, conduct multi-agent reasoning debates, and provide actionable decision support before accidents happen.

Developed for the **ET AI Hackathon 2026** under the theme: **Industrial Intelligence / Worker Safety / Geospatial Safety Analytics**.

---

## ⚡ The Core Problem: SCADA vs. SafetyAI

Indian heavy industries continue to pay a devastating human cost. During the Visakhapatnam Coke Oven Battery accident of January 2025:
- Telemetry **data existed** (elevated gas pressure readings were recorded).
- Traditional SCADA systems **did not trigger** (values were still below the hardwired alarm thresholds).
- There was no unified intelligence layer to connect the data to operational decisions (e.g., active welding permits in the same zone).

| Dimension | Traditional SCADA | SafetyAI v2.0 (This Project) | Impact |
| :--- | :--- | :--- | :--- |
| **Response Mode** | **Reactive**: Fires sirens *after* gas crosses danger threshold. | **Predictive**: Extrapolates trends to predict breaches **33 minutes early**. | Saves critical evacuation lead time. |
| **Data Fusion** | **Siloed**: Knows sensors, but is blind to work permits or rosters. | **Multi-Factor**: Correlates telemetry, active permits, and shift rosters. | Identifies compound hazards. |
| **Decision Flow** | Manual alarms requiring human paging. | **Autonomous Agent Debate**: Weighs Risk, Cost, and Safety voices. | Promotes transparent, logical responses. |
| **Action Loop** | Pure reporting; relies on manual valve shutdown. | **Human-in-the-Loop Loop**: Suspends permits and Pages evacuation. | Triggers immediate risk reduction. |

---

## 🖥️ Screen Layout & Immersive Visual Components

The dashboard is built to resemble a **SpaceX Mission Control / Bloomberg Terminal** console, optimizing for visual storytelling and judge memorability:

1. **Executive Command Center Header**: Bloomberg-style global indicator displaying `Current Risk`, `Affected Zone`, `Time Remaining`, `Lead Time Saved`, `AI Confidence`, and `Recommended Plan`.
2. **Incident Severity Banner**: Flashing alert banner that dominates the screen during active incidents: *"AUTONOMOUS ACTIONS PAUSED - AWAITING OFFICER APPROVAL"*.
3. **Plant Layout Map (Geospatial SVG)**: High-fidelity plant layout with live color-coded risk overlays, active permit indicators, worker coordinate bubbles, and evacuation path animations.
4. **Predictive Trend Chart**: Plots real-time CO levels alongside a dashed 33-minute AI forecasting curve surrounded by a shaded confidence interval band.
5. **Multi-Agent Debate Panel**: Streams debate arguments side-by-side (Risk, Cost, and Safety voices) with typewriter effects, concluding with the Judge Agent's recommendation.
6. **Root Cause Waterfall**: Sequentially lights up blocks to visualize the logical reasoning cascade (CO Rise $\rightarrow$ Permit Conflict $\rightarrow$ Shift Window $\rightarrow$ Historical Memory Match).
7. **System Confidence Breakdown**: Displays confidence vectors (sensor, memory, permit, shift, prediction) that roll up into the overall index.
8. **Flight Recorder (Incident Replay)**: A scrubber scrubber that lets judges pause the live stream, dragging a slider back and forth to inspect telemetry states at any tick.
9. **Outcome Scorecard Card**: Summarizes the business impact (lead time saved, exposed workers protected, downtime avoided: ₹20L+, production impact reduction: 70%).

---

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.13) - in-memory state tracking, deterministic trend forecasting, and live WebSockets broadcasting (`main.py` + `simulator.py`).
- **Frontend**: Vite + React, Tailwind CSS v3, Recharts, Lucide Icons.
- **Verification**: Local automated test suite (`verify_simulation.py`).

---

## 🚀 How to Run the Project Locally

### 1. Run the Backend
Ensure Python 3.10+ is installed. Navigate to the root directory and run:

```bash
# Verify backend tests pass
python backend/verify_simulation.py

# Launch the API server
python backend/main.py
```
The API server will launch at `http://localhost:8000`.

### 2. Run the Frontend
In a new terminal window, navigate to the `frontend/` directory and start Vite:

```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to the local link (typically `http://localhost:5173`).

---

## 📽️ Demo Video Script Beats

Follow this story flow during your 3-4 minute presentation:
1. **0:00 - 0:10 (Intro)**: Displays the SCADA vs. SafetyAI comparison onboarding card. Show the judge: *"Most disasters had the data. SafetyAI connects the reasoning."*
2. **0:10 - 0:25 (Stage 1: Safe)**: Start the **Vizag CO Leak** scenario. Everything is green, telemetry is stable.
3. **0:25 - 0:45 (Stage 2: Prediction)**: CO begins drifting up. The predictive chart projects a breach in 33 minutes. SCADA is still silent because values are below the threshold.
4. **0:45 - 1:05 (Stage 3: Multi-Factor)**: Risk level transitions to PREPARE. Memory Agent matches historical **Incident #23 (91% similarity)**.RAG and shift change indicators highlight.
5. **1:05 - 1:30 (Stage 4: Debate)**: Risk score crosses 75%. The **Agent Debate Panel** opens. Risk, Cost, and Safety voices stream arguments. The Judge Agent recommends Plan A. The system pauses in the Human Approval Gate.
6. **1:30 - 1:45 (Stage 5: Approval)**: Click **Approve Plan A**. The permit instantly displays a flashing `SUSPENDED BY AI` indicator. Evacuation alerts highlight on the Plant Map.
7. **1:45 - 2:20 (Stage 6: Recovery)**: Exhaust fans ramp up. Telemetry on the chart starts declining. Risk drops into RECOVERY.
8. **2:20 - End (Stage 7: Outcome)**: Telemetry stabilizes. The **Outcome Scorecard** overlays: *47 minutes of lead time gained, 8 workers protected, ₹20L+ downtime avoided*. Show judges the **Incident Replay** scrubber to demonstrate post-action flight auditing.
