import time
import math
import os
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional

HISTORICAL_INCIDENTS = [
    {
        "id": "INC-2024-023",
        "name": "Valve Degradation CO Accumulation",
        "similarity": 91,
        "date": "12 MARCH 2024",
        "zone": "Z-01 COKE OVEN",
        "gas_type": "CO",
        "permit_type": "Hot Work",
        "root_cause": "Flange wear and exhaust valve weld degradation triggers methane/CO accumulation during shift changes.",
        "response": "SCADA alarms did not trigger. Evacuation ordered manually 14 minutes post-breach.",
        "outcome": "Near-miss evacuation. High maintenance repair downtime (48 hours).",
        "insight": "Prioritizing Plan A avoids welding spark ignitions flagged in the previous incident."
    },
    {
        "id": "INC-2024-031",
        "name": "Confined Space Nitrogen Leaking",
        "similarity": 94,
        "date": "05 AUGUST 2024",
        "zone": "Z-03 COAL STORAGE",
        "gas_type": "Oxygen",
        "permit_type": "Confined Space",
        "root_cause": "Nitrogen purging in adjacent line leaked through isolating valve into non-ventilated coal bunker.",
        "response": "SCADA was blind to local oxygen drop. High-risk manual recovery needed.",
        "outcome": "2 workers hospitalized. Permit protocol audited post-incident.",
        "insight": "Enforcing ventilation runtime validation prevents confined space suffocation."
    },
    {
        "id": "INC-2023-012",
        "name": "Methane Accumulation Ventilation Failure",
        "similarity": 88,
        "date": "19 NOVEMBER 2023",
        "zone": "Z-07 GAS HOLDER",
        "gas_type": "Methane",
        "permit_type": "General Work",
        "root_cause": "Purging bypass line valve left 5% open during gasket replacement, causing minor pockets of explosive gas.",
        "response": "Siren paged after gas pocket reached LEL. Safe shutdown executed.",
        "outcome": "Zero injuries, minor production delay (3 hours).",
        "insight": "Pre-work gas testing must be refreshed every 2 hours during hot work."
    },
    {
        "id": "INC-2025-044",
        "name": "Conveyor Belt Overheat Fire",
        "similarity": 89,
        "date": "22 JANUARY 2025",
        "zone": "Z-04 SINTER PLANT",
        "gas_type": "Temperature",
        "permit_type": "General Work",
        "root_cause": "Friction build-up on degraded conveyor roller bearings ignited accumulated fine coal dust particles.",
        "response": "Sprinklers triggered manually after smoke alert. Production stopped for shift.",
        "outcome": "Conveyor structure damaged, ₹15L equipment loss.",
        "insight": "Vibration and bearing temperature monitoring must be integrated with drive interlocks."
    }
]

# Scenario Configuration Parameter mapping
SCENARIO_CONFIGS = {
    "CO_LEAK": {
        "sensor_name": "CO",
        "sensor_unit": "ppm",
        "safety_threshold": 50.0,
        "max_domain": 65,
        "affected_zone": "Z-01",
        "target_label": "CO CONCENTRATION (PPM)",
        "normal_base": 15.0,
        "direction": "up",
        "permit_id": "HWP-2241",
        "historical_incident_idx": 0,
        "plan_a": "Plan A: Suspend permit HWP-2241 & ramp extraction ventilation",
        "plan_b": "Plan B: Complete evacuation of visual plant battery",
        "plan_c": "Plan C: Continuously monitor ambient sensor drift"
    },
    "AMMONIA_LEAK": {
        "sensor_name": "NH3",
        "sensor_unit": "ppm",
        "safety_threshold": 25.0,
        "max_domain": 35,
        "affected_zone": "Z-07",
        "target_label": "NH3 CONCENTRATION (PPM)",
        "normal_base": 1.0,
        "direction": "up",
        "permit_id": "HWP-2241",
        "historical_incident_idx": 2,
        "plan_a": "Plan A: Suspend permit HWP-2241 & activate chemical scrubbers",
        "plan_b": "Plan B: Area-wide isolation and evacuation drill",
        "plan_c": "Plan C: Operator monitoring and visual valve check"
    },
    "CONVEYOR_FIRE": {
        "sensor_name": "Temp",
        "sensor_unit": "°C",
        "safety_threshold": 80.0,
        "max_domain": 100,
        "affected_zone": "Z-04",
        "target_label": "BEARING TEMPERATURE (°C)",
        "normal_base": 45.0,
        "direction": "up",
        "permit_id": "CSP-1108",
        "historical_incident_idx": 3,
        "plan_a": "Plan A: Interlock conveyor drive & activate sprinkler lines",
        "plan_b": "Plan B: Full raw coal handling area evacuation",
        "plan_c": "Plan C: Periodic bearing lubrication schedule"
    },
    "BOILER_OVERPRESSURE": {
        "sensor_name": "Pressure",
        "sensor_unit": "bar",
        "safety_threshold": 15.0,
        "max_domain": 20,
        "affected_zone": "Z-02",
        "target_label": "BOILER PRESSURE (BAR)",
        "normal_base": 8.0,
        "direction": "up",
        "permit_id": "HWP-2241",
        "historical_incident_idx": 1,
        "plan_a": "Plan A: Open steam bypass vent valves & trip burners",
        "plan_b": "Plan B: Evacuate power boiler control rooms",
        "plan_c": "Plan C: Manual relief gauge calibration review"
    },
    "CONFINED_SPACE": {
        "sensor_name": "O2",
        "sensor_unit": "%",
        "safety_threshold": 19.5,
        "max_domain": 25,
        "affected_zone": "Z-03",
        "target_label": "OXYGEN CONCENTRATION (%)",
        "normal_base": 20.9,
        "direction": "down",
        "permit_id": "CSP-1108",
        "historical_incident_idx": 1,
        "plan_a": "Plan A: Suspend permit CSP-1108 & ramp intake fans to 100%",
        "plan_b": "Plan B: Standby rescue team emergency deployment",
        "plan_c": "Plan C: Atmospheric oxygen self-contained check"
    }
}

# --- Dataclasses for Decoupled Incident Domain ---

@dataclass
class PlantContext:
    workers_present: int
    ventilation_status: str

@dataclass
class HistoricalMatch:
    id: str
    name: str
    similarity: int
    date: str
    zone: str
    gas_type: str
    permit_type: str
    root_cause: str
    response: str
    outcome: str
    insight: str

@dataclass
class DebateState:
    active: bool
    risk_voice: List[Dict] = field(default_factory=list)
    cost_voice: List[Dict] = field(default_factory=list)
    safety_voice: List[Dict] = field(default_factory=list)
    judge_verdict: Optional[str] = None
    selected_plan: Optional[str] = None

@dataclass
class ApprovalState:
    officer_action: Optional[str] = None
    approval_time_seconds: int = 0
    awaiting_approval: bool = False

@dataclass
class RecoveryState:
    status: str = "SAFE"
    ventilation_ramped: bool = False
    evacuation_status: str = "NONE"

@dataclass
class HumanDecision:
    officer_name: str
    action: str
    timestamp: str
    reasoning: str
    decision_source: str

@dataclass
class ReasoningNode:
    id: str
    title: str
    confidence: float
    impact_score: float
    parents: List[str] = field(default_factory=list)
    status: str = "inactive"

@dataclass
class ReplayEvent:
    tick: int
    timestamp: str
    phase: str
    agent: str
    event_type: str
    payload: dict

@dataclass
class IncidentSession:
    incident_id: str
    preset: str
    phase: str
    plant_context: PlantContext
    historical_match: HistoricalMatch
    debate: DebateState
    approval: ApprovalState
    recovery: RecoveryState
    telemetry_stream_id: str
    replay_stream_id: str
    severity: str = "LOW"
    human_decision: Optional[HumanDecision] = None
    decision_graph: List[ReasoningNode] = field(default_factory=list)

# --- Time-Series and Replay Event Stores ---

class TelemetryStore:
    def __init__(self):
        self.history = {} # stream_id -> list of {"tick": int, "value": float}
        
    def record(self, stream_id: str, tick: int, value: float):
        if stream_id not in self.history:
            self.history[stream_id] = []
        self.history[stream_id].append({"tick": tick, "value": value})
        if len(self.history[stream_id]) > 30:
            self.history[stream_id].pop(0)

class ReplayStore:
    def __init__(self):
        self.events = {} # stream_id -> list of ReplayEvent
        
    def record_event(self, stream_id: str, event: ReplayEvent):
        if stream_id not in self.events:
            self.events[stream_id] = []
        self.events[stream_id].append(event)


# --- Core Safety Simulator Engine ---

class SafetySimulator:
    def __init__(self):
        self.telemetry_store = TelemetryStore()
        self.replay_store = ReplayStore()
        self.reset()

    def reset(self):
        self.scenario = "NORMAL"
        self.preset = "OPERATIONAL_DRIFT"
        self.tick = 0
        self.max_ticks = 60
        self.current_time = "09:00:00"
        self.is_running = False
        self.is_paused = False
        self.simulation_speed = 1.5 # Seconds per tick
        
        # Scenarios mapping
        self.scenario_config = SCENARIO_CONFIGS["CO_LEAK"]
        
        # Generate stream IDs
        self.telemetry_stream_id = f"stream-telemetry-{int(time.time())}"
        self.replay_stream_id = f"stream-replay-{int(time.time())}"

        # Zones Layout
        self.zones = {
            "Z-01": {"name": "Coke Oven Battery Z-01", "status": "SAFE", "risk_score": 18, "co_level": 15.0},
            "Z-02": {"name": "Blast Furnace Z-02", "status": "SAFE", "risk_score": 12, "co_level": 8.0},
            "Z-03": {"name": "Coal Handling Z-03", "status": "SAFE", "risk_score": 10, "co_level": 2.0},
            "Z-04": {"name": "Sinter Plant Z-04", "status": "SAFE", "risk_score": 14, "co_level": 5.0},
            "Z-05": {"name": "Steel Melting SMS-02", "status": "SAFE", "risk_score": 15, "co_level": 4.5},
            "Z-06": {"name": "Rolling Mill RM-01", "status": "SAFE", "risk_score": 8, "co_level": 1.2},
            "Z-07": {"name": "Gas Holder Area", "status": "SAFE", "risk_score": 20, "co_level": 12.0},
            "Z-08": {"name": "Maintenance Depot", "status": "SAFE", "risk_score": 5, "co_level": 0.5}
        }
        
        # Inits telemetry history in the separate store
        self.co_history = [{"tick": i, "value": 15.0} for i in range(-20, 1)]
        self.telemetry_store.history[self.telemetry_stream_id] = self.co_history
        
        # Forecast data
        self.co_forecast = []
        self.prediction_breach = None
        
        # Active Work Permits
        self.permits = {
            "HWP-2241": {
                "id": "HWP-2241",
                "zone": "Z-01",
                "type": "Hot Work",
                "status": "ACTIVE",
                "description": "Exhaust valve welding & maintenance",
                "workers": 4,
                "risk_indicator": "NORMAL"
            },
            "CSP-1108": {
                "id": "CSP-1108",
                "zone": "Z-03",
                "type": "Confined Space",
                "status": "ACTIVE",
                "description": "Coal bunker hopper inspection",
                "workers": 3,
                "risk_indicator": "NORMAL"
            }
        }
        
        # Shift details
        self.shift_change_minutes = 15
        
        # Risk State
        self.overall_risk_score = 18
        self.risk_level = "SAFE"
        self.severity = "LOW"
        self.status_message = "All operations green. SCADA telemetry normal."
        
        # Decision status
        self.officer_action = None
        self.approval_time_seconds = 0
        self.approval_start_time = None
        self.awaiting_approval = False
        
        # Waterfall
        self.waterfall = {
            "co_rise": {"status": "inactive", "label": "Telemetry Rising"},
            "permit_conflict": {"status": "inactive", "label": "Active Permit Conflict"},
            "shift_change": {"status": "inactive", "label": "Shift Change Window"},
            "historical_match": {"status": "inactive", "label": "Historical Match Found"},
            "threshold_breach": {"status": "inactive", "label": "Predicted Breach"},
            "recommended_action": {"status": "inactive", "label": "Recommended Intervention"}
        }

        # Confidence vector
        self.confidence = {
            "sensor": 96,
            "historical": 91,
            "permit": 100,
            "shift": 83,
            "prediction": 88,
            "overall": 87.6
        }
        
        # Logs
        self.logs = [
            {"timestamp": "09:00:00", "agent": "System", "message": "SafetyAI multi-agent reasoning layer initialized."}
        ]
        
        # Debate State
        self.debate = {
            "active": False,
            "risk_voice": [],
            "cost_voice": [],
            "safety_voice": [],
            "judge_verdict": None,
            "selected_plan": None
        }

        # Final outcomes
        self.outcome = None

        # UI parameters
        self.workers_present = 8
        self.ventilation_status = "DEGRADED (40%)"
        self.lead_time_saved = 47
        self.historical_match = dict(HISTORICAL_INCIDENTS[0])
        self.narrator_text = ""
        self._cached_narrator_text = ""

        # Setup reasoning nodes dependency graph
        self.decision_graph = [
            ReasoningNode("co_rise", "Sensor Drift", 0.96, 0.40),
            ReasoningNode("permit_conflict", "Permit Conflict", 1.00, 0.72, ["co_rise"]),
            ReasoningNode("shift_change", "Shift Change Window", 0.83, 0.35, ["co_rise"]),
            ReasoningNode("historical_match", "Historical Similarity", 0.91, 0.60, ["co_rise"]),
            ReasoningNode("threshold_breach", "Threshold Prediction", 0.88, 0.80, ["co_rise", "historical_match"]),
            ReasoningNode("recommended_action", "Recommended Action", 0.90, 0.95, ["threshold_breach", "permit_conflict"])
        ]

        # Init Incident Session dataclass
        self.session = IncidentSession(
            incident_id=f"INC-2026-{os.urandom(2).hex().upper()}",
            preset="OPERATIONAL_DRIFT",
            phase="SAFE",
            plant_context=PlantContext(self.workers_present, self.ventilation_status),
            historical_match=HistoricalMatch(**self.historical_match),
            debate=DebateState(False),
            approval=ApprovalState(),
            recovery=RecoveryState(),
            telemetry_stream_id=self.telemetry_stream_id,
            replay_stream_id=self.replay_stream_id,
            severity="LOW",
            decision_graph=self.decision_graph
        )

    def trigger_scenario(self, name, preset="OPERATIONAL_DRIFT"):
        self.reset()
        self.scenario = name
        self.preset = preset
        self.is_running = True
        
        # Load custom scenario configurations
        if name in SCENARIO_CONFIGS:
            self.scenario_config = SCENARIO_CONFIGS[name]
        else:
            self.scenario_config = SCENARIO_CONFIGS["CO_LEAK"]

        # Customize labels in reasoning graph based on scenario parameter name
        s_name = self.scenario_config["sensor_name"]
        for node in self.decision_graph:
            if node.id == "co_rise":
                node.title = f"{s_name} Telemetry Rising"
            elif node.id == "threshold_breach":
                node.title = f"Predicted {s_name} Breach"

        # Apply correct historical match
        hist_idx = self.scenario_config["historical_incident_idx"]
        self.historical_match = dict(HISTORICAL_INCIDENTS[hist_idx])
        self.session.historical_match = HistoricalMatch(**self.historical_match)
        
        # Initial logs
        self.logs.append({
            "timestamp": "09:00:00",
            "agent": "System",
            "message": f"Simulation scenario '{name}' triggered in preset mode '{preset}'."
        })

    def log_agent(self, agent, message):
        formatted_time = self.get_time_string()
        self.logs.append({
            "timestamp": formatted_time,
            "agent": agent,
            "message": message
        })

    def get_time_string(self):
        total_seconds = self.tick * 30
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"09:{minutes:02d}:{seconds:02d}"

    def update_ticks(self):
        if not self.is_running or self.is_paused or self.awaiting_approval:
            return

        self.tick += 1
        self.current_time = self.get_time_string()

        # Run state machine depending on scenario
        if self.scenario == "NORMAL":
            self.tick_normal()
        else:
            self.tick_scenario_incident()

        # Update narrator narrative
        if self.risk_level != "SAFE":
            self.narrator_text = self.query_narrator_agent()
        else:
            self.narrator_text = ""

    def tick_normal(self):
        val = round(15.0 + math.sin(self.tick) * 0.4, 2)
        self.zones["Z-01"]["co_level"] = val
        self.telemetry_store.record(self.telemetry_stream_id, self.tick, val)

        self.shift_change_minutes = max(0, 15 - (self.tick // 2))
        
        self.overall_risk_score = 18
        self.risk_level = "SAFE"
        self.status_message = "Normal operations. Live telemetry streams healthy."
        self.co_forecast = [
            {"time_offset": 0, "value": val},
            {"time_offset": 10, "value": val + 0.1},
            {"time_offset": 20, "value": val - 0.1},
            {"time_offset": 33, "value": val}
        ]
        self.prediction_breach = None

    def get_offset_time_string(self, offset_minutes):
        total_seconds = self.tick * 30 + offset_minutes * 60
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"09:{minutes:02d}:{seconds:02d}"

    def get_value_for_tick(self, tick, preset, config):
        direction = config["direction"]
        base = config["normal_base"]
        threshold = config["safety_threshold"]
        
        # Scale values dynamically
        if direction == "up":
            target_max = threshold + (8.0 if preset == "CRITICAL_ESCALATION" else 3.0)
            gap = target_max - base
            
            if tick <= 10:
                return round(base + math.sin(tick) * 0.1, 2)
            elif tick <= 20:
                return round(base + gap * 0.3 * ((tick - 10) / 10.0), 2)
            elif tick <= 30:
                return round(base + gap * 0.3 + gap * 0.5 * ((tick - 20) / 10.0), 2)
            elif tick <= 35:
                return round(base + gap * 0.8 + gap * 0.2 * ((tick - 30) / 5.0), 2)
            elif tick <= 45:
                peak = base + gap
                recovered_base = base
                progress = (tick - 35) / 10.0
                return round(peak - (peak - recovered_base) * progress, 2)
            else:
                return round(base + math.sin(tick) * 0.05, 2)
        else:
            # Confined Space Oxygen Drop (drops below threshold)
            target_min = threshold - (3.5 if preset == "CRITICAL_ESCALATION" else 1.5)
            gap = base - target_min
            
            if tick <= 10:
                return round(base - abs(math.sin(tick)) * 0.05, 2)
            elif tick <= 20:
                return round(base - gap * 0.3 * ((tick - 10) / 10.0), 2)
            elif tick <= 30:
                return round(base - gap * 0.3 - gap * 0.5 * ((tick - 20) / 10.0), 2)
            elif tick <= 35:
                return round(base - gap * 0.8 - gap * 0.2 * ((tick - 30) / 5.0), 2)
            elif tick <= 45:
                peak = base - gap
                progress = (tick - 35) / 10.0
                return round(peak + (base - peak) * progress, 2)
            else:
                return round(base - abs(math.sin(tick)) * 0.02, 2)

    def tick_scenario_incident(self):
        cfg = self.scenario_config
        target_zone = cfg["affected_zone"]
        s_name = cfg["sensor_name"]
        
        # Load preset parameters
        if self.preset == "OPERATIONAL_DRIFT":
            shift_start = 15
            shift_step = 0.5
            breach_offset = 33
            confidence_val = 87.6
            similarity_val = 91
            lead_time = 47
            vent_status = "DEGRADED (40%)"
            
            # Dynamic calculation
            workers_in_zone = 10
            exposure_probability = 0.8
            workers = int(workers_in_zone * exposure_probability)
            
            downtime_cost_per_hour = 26.0
            hours_saved = lead_time / 60.0
            downtime_avoided_val = round(downtime_cost_per_hour * hours_saved, 1)
            downtime_val = f"₹{downtime_avoided_val}L+"
        else:
            shift_start = 10
            shift_step = 0.6
            breach_offset = 21
            confidence_val = 92.4
            similarity_val = 95
            lead_time = 35
            vent_status = "CRITICAL (20%)"
            
            # Dynamic calculation
            workers_in_zone = 13
            exposure_probability = 0.923
            workers = int(workers_in_zone * exposure_probability)
            
            downtime_cost_per_hour = 60.0
            hours_saved = lead_time / 60.0
            downtime_avoided_val = round(downtime_cost_per_hour * hours_saved, 1)
            downtime_val = f"₹{downtime_avoided_val}L+"

        self.confidence["overall"] = confidence_val
        self.confidence["overall_confidence"] = confidence_val # support both
        self.confidence["historical"] = similarity_val
        self.workers_present = workers
        self.ventilation_status = vent_status
        self.lead_time_saved = lead_time
        
        # Calculate dynamic telemetric value
        val = self.get_value_for_tick(self.tick, self.preset, cfg)
        
        # Apply level to zones
        self.zones[target_zone]["co_level"] = val
        self.telemetry_store.record(self.telemetry_stream_id, self.tick, val)

        # Stage 1: Healthy (Ticks 1 - 10)
        if self.tick <= 10:
            self.overall_risk_score = 18
            self.risk_level = "SAFE"
            self.session.phase = "SAFE"
            self.status_message = f"Plant healthy. {s_name} levels stable at baseline."
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": val + (0.1 if cfg["direction"] == "up" else -0.1)},
                {"time_offset": 20, "value": val - (0.2 if cfg["direction"] == "up" else -0.2)},
                {"time_offset": breach_offset, "value": val}
            ]
            self.shift_change_minutes = shift_start
            self.waterfall = {k: {"status": "inactive", "label": v["label"]} for k, v in self.waterfall.items()}
            for node in self.decision_graph:
                node.status = "inactive"

        # Stage 2: Drift Detected (Ticks 11 - 20)
        elif 10 < self.tick <= 20:
            self.overall_risk_score = 38
            self.risk_level = "WATCH"
            self.session.phase = "WATCH"
            self.status_message = f"Abnormal drift detected in Zone {target_zone}. Analyzing rate-of-change..."
            
            projected_breach_val = cfg["safety_threshold"] + (1.5 if cfg["direction"] == "up" else -0.8)
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": val + (2.5 if cfg["direction"] == "up" else -1.5)},
                {"time_offset": 20, "value": val + (5.0 if cfg["direction"] == "up" else -3.0)},
                {"time_offset": breach_offset, "value": projected_breach_val}
            ]
            self.prediction_breach = {"time_offset": breach_offset, "value": projected_breach_val, "time_str": self.get_offset_time_string(breach_offset)}
            self.shift_change_minutes = max(1, int(shift_start - (self.tick - 10) * shift_step))
            
            self.waterfall["co_rise"]["status"] = "active"
            self.waterfall["threshold_breach"]["status"] = "active"
            for node in self.decision_graph:
                if node.id in ["co_rise", "threshold_breach"]:
                    node.status = "active"
            
            if self.tick == 11:
                self.log_agent("SensorAgent", f"Anomaly Flagged: {target_zone} {s_name} level drifting ({'rising' if cfg['direction'] == 'up' else 'dropping'}).")
                self.log_agent("PredictionAgent", f"Trend extrapolation warns: {s_name} will breach safety threshold ({cfg['safety_threshold']} {cfg['sensor_unit']}) in {breach_offset} minutes.")
                self.replay_store.record_event(self.replay_stream_id, ReplayEvent(self.tick, self.current_time, "WATCH", "SensorAgent", "ANOMALY", {"value": val}))

        # Stage 3: Multi-Factor Conflict (Ticks 21 - 30)
        elif 20 < self.tick <= 30:
            self.overall_risk_score = 68
            self.risk_level = "PREPARE"
            self.session.phase = "PREPARE"
            
            if self.tick <= 25:
                self.status_message = "Multi-factor safety risk detected. Active permit conflict & shift changeover gap overlapping."
            else:
                self.status_message = "Compiling candidate mitigation strategies. SafetyAI Planner Agent generating risk-reduction plans."
            
            projected_breach_val = cfg["safety_threshold"] + (3.0 if cfg["direction"] == "up" else -1.5)
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": val + (3.0 if cfg["direction"] == "up" else -1.8)},
                {"time_offset": 20, "value": val + (6.0 if cfg["direction"] == "up" else -3.6)},
                {"time_offset": breach_offset, "value": projected_breach_val}
            ]
            self.prediction_breach = {"time_offset": breach_offset, "value": projected_breach_val, "time_str": self.get_offset_time_string(breach_offset)}
            self.shift_change_minutes = max(1, int(shift_start - 10 * shift_step - (self.tick - 20) * 0.4))
            
            self.permits[cfg["permit_id"]]["risk_indicator"] = "WARNING"
            for k in ["co_rise", "permit_conflict", "shift_change", "historical_match", "threshold_breach"]:
                self.waterfall[k]["status"] = "active"
            for node in self.decision_graph:
                if node.id != "recommended_action":
                     node.status = "active"

            if self.tick == 21:
                self.log_agent("PermitAgent", f"Conflict Detected: Active permit {cfg['permit_id']} ({self.permits[cfg['permit_id']]['type']}) inside risk area {target_zone}.")
                self.log_agent("ShiftAgent", f"Fatigue Window Active: Shift change in {self.shift_change_minutes} minutes. Communication gap risk multiplier = 1.4x.")
                self.log_agent("MemoryAgent", f"Operational Memory Match Found: {similarity_val}% similarity with {self.historical_match['id']} ({self.historical_match['name']}).")
                self.replay_store.record_event(self.replay_stream_id, ReplayEvent(self.tick, self.current_time, "PREPARE", "PermitAgent", "CONFLICT", {}))

            if self.tick == 26:
                self.log_agent("PlannerAgent", "Candidate Plans generated. Initiating safety impact simulation...")
                self.log_agent("PlannerAgent", "Plan A: Selective Permit Suspension & Vent Override (Risk reduction: 70%, Cost: ₹0)")
                self.log_agent("PlannerAgent", f"Plan B: Complete Zone Evacuation & Fan Ramp-up (Risk reduction: 95%, Cost: ₹{35 if self.preset == 'CRITICAL_ESCALATION' else 20}L)")
                self.log_agent("PlannerAgent", "Plan C: System Alert Mode / Standby Monitoring (Risk reduction: 15%, Cost: ₹0)")

        # Stage 4: Agent Debate & Human Override pause (Ticks 31 - 35)
        elif 30 < self.tick <= 35:
            self.overall_risk_score = 88
            self.risk_level = "ACT"
            self.session.phase = "ACT"
            self.status_message = f"Critical threshold risk. Multi-agent debate concluded. SAFETY OFFICER APPROVAL REQUIRED."
            
            projected_breach_val = cfg["safety_threshold"] + (4.0 if cfg["direction"] == "up" else -2.0)
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": val + (1.0 if cfg["direction"] == "up" else -0.5)},
                {"time_offset": 20, "value": val + (2.0 if cfg["direction"] == "up" else -1.0)},
                {"time_offset": breach_offset, "value": projected_breach_val}
            ]
            self.prediction_breach = {"time_offset": breach_offset, "value": projected_breach_val, "time_str": self.get_offset_time_string(breach_offset)}
            self.shift_change_minutes = max(1, int(shift_start - 10 * shift_step - 10 * 0.4 - (self.tick - 30) * 0.2))
            
            for k in self.waterfall:
                self.waterfall[k]["status"] = "active"
            for node in self.decision_graph:
                node.status = "active"

            if self.tick == 31:
                self.log_agent("PlannerAgent", f"Recommendation generated: Suspend permit {cfg['permit_id']} & increase ventilation extraction capacity (Risk delta: -70%, Cost: ₹0).")
                self.log_agent("ValidatorAgent", f"Compliance check: Plan complies with OISD regulations. Safety overrides show no historical rejection.")
                self.log_agent("System", "Overall Risk score crossed 75%. Launching Agent Debate Layer.")
                self.trigger_debate()
                self.replay_store.record_event(self.replay_stream_id, ReplayEvent(self.tick, self.current_time, "ACT", "PlannerAgent", "RECOMMENDATION", {}))

            if self.officer_action is None:
                self.awaiting_approval = True
                self.session.approval.awaiting_approval = True
                self.approval_start_time = time.time()

        # Stage 5: Intervention / Recovery (Ticks 36 - 45)
        elif 35 < self.tick <= 45:
            self.overall_risk_score = 55
            self.risk_level = "RECOVERY"
            self.session.phase = "RECOVERY"
            self.status_message = f"Intervention active. Air extraction fans at 100% capacity. Zone {target_zone} safety levels recovering."
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": max(15.0, val - 15.0) if cfg["direction"] == "up" else min(20.9, val + 2.0)},
                {"time_offset": 20, "value": cfg["normal_base"]},
                {"time_offset": breach_offset, "value": cfg["normal_base"]}
            ]
            self.prediction_breach = None
            self.shift_change_minutes = max(1, self.shift_change_minutes - 1)

        # Stage 6: Recovery Complete (Ticks 46 - 55)
        elif 45 < self.tick <= 55:
            self.overall_risk_score = 23
            self.risk_level = "RECOVERY"
            self.session.phase = "RECOVERY"
            self.status_message = "Atmosphere normalized. Preparing incident post-action compliance log."
            self.co_forecast = [
                {"time_offset": 0, "value": val},
                {"time_offset": 10, "value": val},
                {"time_offset": 20, "value": val},
                {"time_offset": breach_offset, "value": val}
            ]
            
            if self.tick == 46:
                self.log_agent("RecoveryAgent", "Recovery Loop: Telemetry confirms zone atmospheric indexes normalized. Air safety index at 98%.")
                self.log_agent("RecoveryAgent", "System updated historical similarity model vectors with successful resolution.")
                self.replay_store.record_event(self.replay_stream_id, ReplayEvent(self.tick, self.current_time, "RECOVERY", "RecoveryAgent", "STABILIZED", {}))

        # Stage 7: Outcome Summary Screen (Ticks 56 - 60)
        else:
            self.overall_risk_score = 15
            self.risk_level = "CLOSED"
            self.session.phase = "CLOSED"
            self.status_message = f"Incident successfully resolved and closed. {lead_time} minutes of safety lead time generated."
            
            self.outcome = {
                "lead_time": f"{lead_time} minutes",
                "workers_protected": workers,
                "downtime_avoided": downtime_val,
                "production_impact_reduction": "70%",
                "confidence": confidence_val,
                "status": "CLOSED"
            }

            # Generate compliance export artifact on completion
            if self.tick == 56:
                self.log_agent("System", "Incident closed. Compliance audit record generated.")
                self.is_running = False
                
                # Audit log timeline timestamps
                export_data = {
                    "incident_id": self.session.incident_id,
                    "scenario": self.scenario,
                    "preset": self.preset,
                    "plant": "Vizag Steel Plant",
                    "affected_zone": self.scenario_config["affected_zone"],
                    "sensor_name": self.scenario_config["sensor_name"],
                    "severity": self.severity,
                    "lead_time_saved_minutes": self.lead_time_saved,
                    "workers_protected": workers,
                    "approved_by": "Safety Officer" if self.officer_action == "APPROVED" else "Plant Manager",
                    "decision_source": "HUMAN_APPROVAL" if self.officer_action == "APPROVED" else "HUMAN_OVERRIDE",
                    "false_positive": False,
                    "intervention_required": True,
                    "downtime_minutes": 43 if self.officer_action == "APPROVED" else 120,
                    "timeline": {
                        "anomaly_detected": "09:05:30",
                        "prediction_generated": "09:06:12",
                        "human_approval": "09:07:51",
                        "mitigation_started": "09:08:04",
                        "system_stabilized": "09:14:10"
                    },
                    "kpis": {
                        "time_to_detection_sec": 312 if self.preset == "OPERATIONAL_DRIFT" else 180,
                        "time_to_prediction_sec": 355 if self.preset == "OPERATIONAL_DRIFT" else 240,
                        "time_to_approval_sec": self.approval_time_seconds if self.approval_time_seconds > 0 else 11,
                        "time_to_action_sec": 24 if self.preset == "OPERATIONAL_DRIFT" else 15,
                        "time_to_stabilization_sec": 428 if self.preset == "OPERATIONAL_DRIFT" else 300
                    }
                }
                try:
                    filepath = os.path.join(os.path.dirname(__file__), f"incident_export_{self.session.incident_id}.json")
                    with open(filepath, "w") as f:
                        json.dump(export_data, f, indent=2)
                except Exception as e:
                    print(f"Error exporting compliance record: {e}")

        # Keep history records synchronized
        self.co_history.append({"tick": self.tick, "value": val})
        if len(self.co_history) > 30:
            self.co_history.pop(0)

    # Fallback/Backward compat for old test cases
    def tick_co_leak(self):
        self.tick_scenario_incident()

    def query_narrator_agent(self):
        if self.tick not in [11, 21, 31, 36, 46, 56] and getattr(self, "_cached_narrator_text", ""):
            return self._cached_narrator_text

        input_data = {
            "sensor_data": {
                "zone": self.scenario_config["affected_zone"],
                "value": self.zones[self.scenario_config["affected_zone"]]["co_level"],
                "unit": self.scenario_config["sensor_unit"],
                "risk_score": self.zones[self.scenario_config["affected_zone"]]["risk_score"],
                "risk_level": self.risk_level
            },
            "permit_data": self.permits[self.scenario_config["permit_id"]],
            "shift_context": {
                "time_to_handover_min": self.shift_change_minutes
            },
            "historical_matches": [self.historical_match],
            "selected_plan": "Plan A"
        }
        
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                prompt = f"""
                You are the SafetyAI Narrator Agent. Analyze the following current telemetry and context and provide a safety narrative:
                
                Input Context:
                {json.dumps(input_data, indent=2)}
                
                Generate a highly structured safety narrative including:
                1. Causal Explanation (Why is the risk rising? Intersect gas levels, permit, shift changes, etc.)
                2. Executive Summary (High-level overview of active danger)
                3. Evidence Chain (Data points proving the threat)
                4. Intervention Rationale (Why Plan A is recommended and what it does)
                
                Output should be formatted as clean, premium, readable paragraphs (avoid raw JSON). Keep it concise, formal, and authoritative.
                """
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=300,
                    temperature=0.2
                )
                narrative = response.choices[0].message.content.strip()
                self._cached_narrator_text = narrative
                return narrative
            except Exception:
                pass
                
        narrative = self.generate_local_narrator_text(input_data)
        self._cached_narrator_text = narrative
        return narrative

    def generate_local_narrator_text(self, input_data):
        cfg = self.scenario_config
        val = input_data["sensor_data"]["value"]
        mins = input_data["shift_context"]["time_to_handover_min"]
        sim = input_data["historical_matches"][0]["similarity"]
        inc_id = input_data["historical_matches"][0]["id"]
        s_name = cfg["sensor_name"]
        
        if self.preset == "OPERATIONAL_DRIFT":
            causal = f"{s_name} levels in Zone {cfg['affected_zone']} have drifted to {val} {cfg['sensor_unit']} due to degraded venting capacity ({self.ventilation_status}) while permit {cfg['permit_id']} is actively open."
            summary = f"SafetyAI has flagged an abnormal {s_name} drift. High-fidelity forecast extrapolates safety threshold limits will be breached."
            evidence = f"Evidence Chain: Sensor value is {val} {cfg['sensor_unit']}, welding activities are present in zone, and shift transition window occurs in {mins} minutes."
            rationale = f"Intervention Rationale: Permit suspension (Plan A) removes local ignition sources and ramping fans to 100% purges zone area safely."
        else:
            causal = f"{s_name} concentration in Zone {cfg['affected_zone']} has accelerated sharply to {val} {cfg['sensor_unit']}, exacerbated by severe ventilation failure ({self.ventilation_status}) and active permit {cfg['permit_id']}."
            summary = "Immediate critical danger. Autonomous forecasting projects a severe and rapid safety threshold breach overlapping a shift handover gap."
            evidence = f"Evidence Chain: Telemetry level is {val} {cfg['sensor_unit']}, permit is active, and only {mins} minutes remain until shift handover."
            rationale = f"Intervention Rationale: Selective permit suspension (Plan A) eliminates spark danger, and ventilation purges prevent gas build-up without full plant shutdown."

        memory_str = f"Operational memory matches {sim}% similarity with historical incident {inc_id} where delayed action led to a reportable event."
        return f"{summary}\n\n{causal}\n\n{evidence}\n\n{memory_str}\n\n{rationale}"

    def trigger_debate(self):
        cfg = self.scenario_config
        s_name = cfg["sensor_name"]
        unit = cfg["sensor_unit"]
        self.debate = {
            "active": True,
            "selected_plan": "Plan A",
            "risk_voice": [
                {"speaker": "Risk Voice", "text": f"Argument from pure safety standpoint: Compound risk index at 0.88. Active permit {cfg['permit_id']} inside zone {cfg['affected_zone']} poses immediate danger. Similar historical events led to {self.workers_present} casualties. We must suspend all permits and evacuate Zone {cfg['affected_zone']} immediately!"}
            ],
            "cost_voice": [
                {"speaker": "Cost Voice", "text": f"Operational continuity review: Full area evacuation triggers shutdown procedures, costing ₹20L per hour in downtime. Plan A (selective permit suspension & increasing fan capacity to 100%) achieves 70% risk reduction at zero shutdown cost."}
            ],
            "safety_voice": [
                {"speaker": "Safety Voice", "text": f"Regulatory compliance directive: Section 4.2 mandates immediate permit suspension when combustible readings exceed LEL. {s_name} in {cfg['affected_zone']} has hit {self.zones[cfg['affected_zone']]['co_level']} {unit}. Suspension is legally mandatory."}
            ],
            "judge_verdict": f"Safety Voice invoked a mandatory compliance rule. Risk Voice's historical matching validates the severe threat. Plan A matches the dual orchestrator objective: suspend permit {cfg['permit_id']} and increase extraction ventilation. Risk reduced by 70% without full plant shutdown. Recommendation: EXECUTE PLAN A."
        }
        self.session.debate = DebateState(
            active=True,
            risk_voice=self.debate["risk_voice"],
            cost_voice=self.debate["cost_voice"],
            safety_voice=self.debate["safety_voice"],
            judge_verdict=self.debate["judge_verdict"],
            selected_plan=self.debate["selected_plan"]
        )

    def approve_plan(self):
        cfg = self.scenario_config
        self.officer_action = "APPROVED"
        self.awaiting_approval = False
        self.session.approval.awaiting_approval = False
        self.session.approval.officer_action = "APPROVED"
        
        if self.approval_start_time:
            self.approval_time_seconds = int(time.time() - self.approval_start_time)
            if self.approval_time_seconds > 30 or self.approval_time_seconds < 2:
                self.approval_time_seconds = 11
        else:
            self.approval_time_seconds = 11
            
        self.session.approval.approval_time_seconds = self.approval_time_seconds

        self.permits[cfg["permit_id"]]["status"] = "SUSPENDED_BY_AI"
        self.zones[cfg["affected_zone"]]["status"] = "RECOVERY"
        
        # Instantiate HumanDecision object
        self.session.human_decision = HumanDecision(
            officer_name="Operations Officer",
            action="APPROVE_PLAN_A",
            timestamp=self.current_time,
            reasoning=f"Approved selective suspension of permit {cfg['permit_id']} and ramped ventilation to 100%.",
            decision_source="HUMAN_APPROVAL"
        )

        self.log_agent("System", f"Officer approved recommendation Plan A. Approval action logged in 11 seconds. Executing emergency response controls...")
        self.log_agent("RecoveryAgent", f"Executing response: Suspending permit {cfg['permit_id']}. Paging supervisor. Ramping Z-01 extraction fans to 100% capacity.")
        
    def escalate_plan(self):
        cfg = self.scenario_config
        self.officer_action = "ESCALATED"
        self.awaiting_approval = False
        self.session.approval.awaiting_approval = False
        self.session.approval.officer_action = "ESCALATED"
        
        self.permits[cfg["permit_id"]]["status"] = "SUSPENDED_BY_OFFICER"
        self.zones[cfg["affected_zone"]]["status"] = "RECOVERY"

        self.session.human_decision = HumanDecision(
            officer_name="Operations Officer",
            action="ESCALATE_TO_PGM",
            timestamp=self.current_time,
            reasoning=f"Escalated welding permit clash in {cfg['affected_zone']} to General Manager.",
            decision_source="HUMAN_OVERRIDE"
        )

        self.log_agent("System", "Safety officer escalated decision to Plant General Manager. Running mitigation override...")

    def get_serializable_state(self):
        cfg = self.scenario_config
        
        # Build dynamic candidate plans list
        candidate_plans = [
            {
                "id": "PLAN_A",
                "title": cfg["plan_a"],
                "risk_reduction": 70.0,
                "downtime_cost": 0.0,
                "compliance_score": 100.0,
                "status": "SELECTED" if self.officer_action == "APPROVED" else "PROPOSED"
            },
            {
                "id": "PLAN_B",
                "title": cfg["plan_b"],
                "risk_reduction": 95.0,
                "downtime_cost": 35.0 if self.preset == "CRITICAL_ESCALATION" else 20.0,
                "compliance_score": 90.0,
                "status": "REJECTED"
            },
            {
                "id": "PLAN_C",
                "title": cfg["plan_c"],
                "risk_reduction": 15.0,
                "downtime_cost": 0.0,
                "compliance_score": 30.0,
                "status": "REJECTED"
            }
        ]

        # Audit timeline metrics
        timeline = {}
        if self.tick > 10:
            timeline["anomaly_detected"] = "09:05:30"
        if self.tick > 20:
            timeline["prediction_generated"] = "09:06:12"
        if self.officer_action:
            timeline["human_approval"] = "09:07:51"
            timeline["mitigation_started"] = "09:08:04"
        if self.tick > 45:
            timeline["system_stabilized"] = "09:14:10"

        # Model confidence contributions breakdown
        confidence_breakdown = [
            {"factor": "Sensor Agreement", "contribution": 24.0, "confidence": 0.96},
            {"factor": "Permit Validation", "contribution": 21.0, "confidence": 1.00},
            {"factor": "Trend Consistency", "contribution": 18.0, "confidence": 0.88},
            {"factor": "Historical Similarity", "contribution": 16.0, "confidence": 0.91 if self.preset == "OPERATIONAL_DRIFT" else 0.95},
            {"factor": "Shift Timing Correlation", "contribution": 8.0, "confidence": 0.83}
        ]

        return {
            "scenario": self.scenario,
            "preset": self.preset,
            "tick": self.tick,
            "max_ticks": self.max_ticks,
            "current_time": self.current_time,
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "zones": self.zones,
            "co_history": self.telemetry_store.history.get(self.telemetry_stream_id, []),
            "co_forecast": self.co_forecast,
            "prediction_breach": self.prediction_breach,
            "permits": self.permits,
            "shift_change_minutes": self.shift_change_minutes,
            "overall_risk_score": self.overall_risk_score,
            "risk_level": self.risk_level,
            "severity": self.severity,
            "status_message": self.status_message,
            "officer_action": self.officer_action,
            "approval_time_seconds": self.approval_time_seconds,
            "awaiting_approval": self.awaiting_approval,
            "waterfall": self.waterfall,
            "confidence": self.confidence,
            "logs": self.logs[-20:],
            "debate": self.debate,
            "outcome": self.outcome,
            "workers_present": self.workers_present,
            "ventilation_status": self.ventilation_status,
            "lead_time_saved": self.lead_time_saved,
            "historical_match": self.historical_match,
            "narrator_text": self.narrator_text,
            
            # Scenario specific details
            "sensor_name": cfg["sensor_name"],
            "sensor_unit": cfg["sensor_unit"],
            "safety_threshold": cfg["safety_threshold"],
            "max_domain": cfg["max_domain"],
            "affected_zone": cfg["affected_zone"],
            "target_label": cfg["target_label"],
            
            # Audit values
            "candidate_plans": candidate_plans,
            "confidence_breakdown": confidence_breakdown,
            "timeline_metrics": timeline,
            "kpis": {
                "time_to_detection_sec": 312 if self.preset == "OPERATIONAL_DRIFT" else 180,
                "time_to_prediction_sec": 355 if self.preset == "OPERATIONAL_DRIFT" else 240,
                "time_to_approval_sec": self.approval_time_seconds if self.approval_time_seconds > 0 else 11,
                "time_to_action_sec": 24 if self.preset == "OPERATIONAL_DRIFT" else 15,
                "time_to_stabilization_sec": 428 if self.preset == "OPERATIONAL_DRIFT" else 300
            },
            "human_decision": self.session.human_decision.__dict__ if self.session.human_decision else None
        }

    def get_narrative_structure(self):
        cfg = self.scenario_config
        s_name = cfg["sensor_name"]
        unit = cfg["sensor_unit"]
        val = self.zones[cfg["affected_zone"]]["co_level"]
        mins = self.shift_change_minutes
        
        summary = f"SafetyAI has flagged an abnormal {s_name} drift in Zone {cfg['affected_zone']}."
        if self.risk_level == "SAFE":
            summary = f"All systems normal. Ambient {s_name} level at baseline."
            why_intervened = []
            recommended_action = "No intervention required."
            expected_outcome = "Continuous safe operations."
        elif self.risk_level == "WATCH":
            summary = f"Drift warning: abnormal {s_name} rise detected."
            why_intervened = [
                f"Sensor reading drifted to {val} {unit}.",
                f"Welding sparkles or maintenance active under permit {cfg['permit_id']}."
            ]
            recommended_action = "Monitor sensor rate of rise."
            expected_outcome = f"Normalizing {s_name} via standard atmospheric circulation."
        else:
            why_intervened = [
                f"Sensor level breached threshold at {val} {unit} (limit: {cfg['safety_threshold']}).",
                f"Active permit {cfg['permit_id']} creates high-risk welding spark risk.",
                f"Shift change gap in {mins} minutes introduces worker coordination risk."
            ]
            recommended_action = cfg["plan_a"]
            expected_outcome = "70% risk reduction at zero downtime cost."

        return {
            "summary": summary,
            "why_intervened": why_intervened,
            "recommended_action": recommended_action,
            "human_override_status": self.officer_action or "AWAITING_REVIEW",
            "expected_outcome": expected_outcome
        }
