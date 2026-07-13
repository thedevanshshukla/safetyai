import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import PlantMap from './components/PlantMap';
import PredictionChart from './components/PredictionChart';
import RiskMeter from './components/RiskMeter';
import DebatePanel from './components/DebatePanel';
import RootCauseWaterfall from './components/RootCauseWaterfall';
import ConfidenceBreakdown from './components/ConfidenceBreakdown';
import IncidentReplay from './components/IncidentReplay';
import PermitPanel from './components/PermitPanel';
import HistoricalMatchCard from './components/HistoricalMatchCard';
import AgentActivityFeed from './components/AgentActivityFeed';
import RiskTimeline from './components/RiskTimeline';
import NarratorCard from './components/NarratorCard';
import OperationalContextCard from './components/OperationalContextCard';
import { Shield, Play, RotateCcw, AlertTriangle, ShieldAlert, Award, FileSpreadsheet, ArrowLeft, Cpu, Compass, CheckCircle } from 'lucide-react';

// 1. ONBOARDING SCREEN
const OnboardingScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-[#F1F5F9] flex flex-col items-center justify-center text-slate-800 z-50 p-6 select-none font-sans">
      <div className="max-w-2xl w-full border border-slate-200 bg-white rounded-lg p-8 shadow-xl relative overflow-hidden">
        {/* Pulsing glow strip */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent animate-pulse"></div>
        
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-[#4F46E5] animate-pulse" size={32} />
          <h1 className="text-xl font-bold tracking-widest uppercase text-slate-800">SafetyAI v2.0 Platform</h1>
        </div>

        <div className="space-y-6">
          <div className="border border-slate-200 bg-slate-50 rounded p-4">
            <span className="text-[10px] text-[#4F46E5] uppercase tracking-widest font-bold block mb-2">Traditional SCADA Systems</span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              <span className="text-red-600 font-bold font-sans">REACTIVE MODE:</span> SCADA waits for Carbon Monoxide thresholds to be breached (50 ppm) before firing warning sirens. By then, workplace entrapment is already high-risk and dangerous.
            </p>
          </div>

          <div className="border border-blue-200/60 bg-blue-50/50 rounded p-4 shadow-sm">
            <span className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold block mb-2">SafetyAI Layer</span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              <span className="text-emerald-700 font-bold font-sans">PREDICTIVE AGENTIC MODE:</span> Extrapolates sensor trends to project breaches early. Simultaneously correlates active welder permits, shift fatigue rosters, and memory databases to execute safety suspensions before accidents.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-6 py-2.5 rounded bg-[#4F46E5] text-white font-bold uppercase text-xs hover:bg-blue-700 transition-all duration-200 active:scale-98 shadow-md"
        >
          Launch Intelligence Console
        </button>
      </div>
    </div>
  );
};

// 2. DASHBOARD / SELECTOR SCREEN
const DashboardSelector = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState("OPERATIONAL_DRIFT");
  const [filterMode, setFilterMode] = useState("ALL");

  const scenarios = [
    {
      id: "co-leak",
      title: "Coke Oven Gas Leak",
      icon: "🏭",
      severity: "HIGH RISK",
      severityClass: "border-amber-600 text-amber-650 bg-amber-50/20",
      desc: "Carbon Monoxide (CO) accumulation in Battery Z-01. Welding spark permit overlaps shift handover window.",
      metric: "CO (PPM)",
      estBreach: selectedPreset === "OPERATIONAL_DRIFT" ? "~33m" : "~21m",
      route: `/scenario/co-leak?preset=${selectedPreset}`
    },
    {
      id: "ammonia-leak",
      title: "Ammonia Storage Leak",
      icon: "🧪",
      severity: "HIGH RISK",
      severityClass: "border-amber-600 text-amber-650 bg-amber-50/20",
      desc: "Anhydrous Ammonia (NH3) accumulation in Storage Tank Z-07. Purge valve degradation triggers leak risk.",
      metric: "NH3 (PPM)",
      estBreach: selectedPreset === "OPERATIONAL_DRIFT" ? "~33m" : "~21m",
      route: `/scenario/ammonia-leak?preset=${selectedPreset}`
    },
    {
      id: "conveyor-fire",
      title: "Conveyor Overheat Fire",
      icon: "🔥",
      severity: "CRITICAL",
      severityClass: "border-red-500 text-red-600 animate-pulse bg-red-50/10",
      desc: "Sinter raw feed conveyor bearings friction heat in Z-04. High coal dust density ignites conveyor belts.",
      metric: "TEMP (°C)",
      estBreach: selectedPreset === "OPERATIONAL_DRIFT" ? "~33m" : "~21m",
      route: `/scenario/conveyor-fire?preset=${selectedPreset}`
    },
    {
      id: "boiler-overpressure",
      title: "Boiler Overpressure",
      icon: "💨",
      severity: "HIGH RISK",
      severityClass: "border-amber-600 text-amber-650 bg-amber-50/20",
      desc: "Utility steam boiler block Z-02 pressure overload. Steam purge bypass line weld blockage triggers pressure build-up.",
      metric: "PRESSURE (BAR)",
      estBreach: selectedPreset === "OPERATIONAL_DRIFT" ? "~33m" : "~21m",
      route: `/scenario/boiler-overpressure?preset=${selectedPreset}`
    },
    {
      id: "confined-space",
      title: "Oxygen Deficiency",
      icon: "🤿",
      severity: "CRITICAL",
      severityClass: "border-red-500 text-red-600 animate-pulse bg-red-50/10",
      desc: "Coal Storage bunker Z-03. Adjacent nitrogen purging lines bleed through seals during hopper inspections.",
      metric: "OXYGEN (%)",
      estBreach: selectedPreset === "OPERATIONAL_DRIFT" ? "~33m" : "~21m",
      route: `/scenario/confined-space?preset=${selectedPreset}`
    },
    {
      id: "normal",
      title: "Normal Operations",
      icon: "✅",
      severity: "STABLE",
      severityClass: "border-emerald-500 text-emerald-600 bg-emerald-50/20",
      desc: "Standard baseline monitoring. Normal ambient fluctuations, permits compliant, extraction ventilation stable.",
      metric: "NOMINAL",
      estBreach: "NO EVENTS DETECTED",
      route: `/scenario/co-leak?preset=NORMAL`
    }
  ];

  const filteredScenarios = scenarios.filter(s => {
    if (filterMode === "CRITICAL") return s.severity === "CRITICAL";
    if (filterMode === "SAFE") return s.severity === "STABLE";
    return true;
  });

  return (
    <div className="fixed inset-0 bg-[#F1F5F9] flex flex-col items-center justify-center text-slate-800 z-50 p-6 select-none font-sans overflow-y-auto">
      <div className="max-w-4xl w-full py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800 mb-2">SafetyAI v2.0 Control Console</h2>
          <p className="text-xs text-slate-500 font-sans">Select a safety incident simulation scenario and operational preset to evaluate the predictive safety platform</p>
        </div>

        {/* Preset Selector Panel */}
        <div className="border border-slate-200 bg-white rounded-lg p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="text-left">
            <span className="text-[10px] text-[#4F46E5] uppercase tracking-widest font-bold block mb-1">Incident Simulation Presets</span>
            <p className="text-[11px] text-slate-500 font-sans">Configure the severity and rate of change parameters for the active simulation session.</p>
          </div>
          <div className="flex space-x-2 bg-slate-55 p-1 border border-slate-200 rounded">
            <button
              onClick={() => setSelectedPreset("OPERATIONAL_DRIFT")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all duration-205 cursor-pointer ${
                selectedPreset === "OPERATIONAL_DRIFT"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-855"
              }`}
            >
              Operational Drift
            </button>
            <button
              onClick={() => setSelectedPreset("CRITICAL_ESCALATION")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all duration-205 cursor-pointer ${
                selectedPreset === "CRITICAL_ESCALATION"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-855"
              }`}
            >
              Critical Escalation
            </button>
          </div>
        </div>

        {/* Dynamic Filter bar for Scenario Severity/Type */}
        <div className="border border-slate-200 bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm w-full">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1 font-mono">
              Scenario Filter: {filterMode === "ALL" ? "All Systems" : filterMode === "CRITICAL" ? "Critical Indicators" : "Baseline Safety"}
            </span>
            <p className="text-[11.5px] text-slate-500 font-sans">Filter the console dashboard view below by severity metrics to isolate emergency events.</p>
          </div>
          <div className="flex space-x-2 bg-slate-50 p-1 border border-slate-200 rounded">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all duration-200 cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              All Scenarios
            </button>
            <button
              onClick={() => setFilterMode("CRITICAL")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all duration-200 cursor-pointer ${
                filterMode === "CRITICAL"
                  ? "bg-red-650 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Critical Only
            </button>
            <button
              onClick={() => setFilterMode("SAFE")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all duration-200 cursor-pointer ${
                filterMode === "SAFE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Sample Safe
            </button>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map((scenario) => (
            <div 
              key={scenario.id}
              onClick={() => navigate(scenario.route)}
              className="border border-slate-200 bg-white hover:border-[#4F46E5]/50 hover:shadow-md rounded-lg p-5 cursor-pointer transition-all duration-350 group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[170px]"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">{scenario.icon}</span>
                  <span className={`border text-[8px] px-1 py-0.5 rounded font-bold uppercase ${scenario.severityClass}`}>
                    {scenario.severity}
                  </span>
                </div>
                <h3 className="text-xs font-bold uppercase text-slate-850 group-hover:text-[#4F46E5] transition-colors">{scenario.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-normal font-sans">
                  {scenario.desc}
                </p>
              </div>
              <div className="mt-3 text-[8.5px] text-[#4F46E5] border-t border-slate-100 pt-2 flex justify-between">
                <span>EST. BREACH: {scenario.estBreach}</span>
                <span className="font-mono">{scenario.metric}</span>
              </div>
            </div>
          ))}

          {filteredScenarios.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white border border-slate-200 rounded-lg p-5">
              <span className="text-xs text-slate-400 font-sans block">No scenarios match the selected filter.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. MAIN COMMAND CENTER COMPONENT
const CommandCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preset = queryParams.get("preset") || "OPERATIONAL_DRIFT";

  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [liveState, setLiveState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayData, setReplayData] = useState([]);
  const [activeZone, setActiveZone] = useState("Z-01");
  const [activeView, setActiveView] = useState("OVERVIEW");
  const socketRef = useRef(null);

  // Connection & Trigger on mount
  useEffect(() => {
    const scenarioKey = location.pathname.includes("co-leak") ? "CO_LEAK" 
                      : location.pathname.includes("ammonia-leak") ? "AMMONIA_LEAK"
                      : location.pathname.includes("conveyor-fire") ? "CONVEYOR_FIRE"
                      : location.pathname.includes("boiler-overpressure") ? "BOILER_OVERPRESSURE"
                      : location.pathname.includes("confined-space") ? "CONFINED_SPACE"
                      : "CO_LEAK";
    const scenario = preset === "NORMAL" ? "NORMAL" : scenarioKey;

    fetch(`http://${window.location.hostname}:8000/api/scenario/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, preset })
    })
      .catch(err => console.error("Error triggering scenario:", err));

    // 2. Fetch Replay Data corresponding to preset
    fetch(`http://${window.location.hostname}:8000/api/replay?preset=${preset}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok") {
          setReplayData(res.replay);
        }
      })
      .catch(err => console.error("Error loading replay dataset:", err));

    // 3. Setup Live WebSocket connection
    const client = new WebSocket(`ws://${window.location.hostname}:8000/ws/live`);
    client.onopen = () => setIsConnected(true);
    client.onclose = () => setIsConnected(false);
    client.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "STATE_UPDATE") {
        setLiveState(msg.data);
      }
    };
    socketRef.current = client;

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [preset, location.pathname]);

  const sendControl = (action) => {
    fetch(`http://${window.location.hostname}:8000/api/scenario/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    }).catch(err => console.error("Error sending control action:", err));
  };

  const approvePlan = () => {
    fetch(`http://${window.location.hostname}:8000/api/scenario/approve`, { method: 'POST' })
      .catch(err => console.error("Error approving action:", err));
  };

  const escalatePlan = () => {
    fetch(`http://${window.location.hostname}:8000/api/scenario/escalate`, { method: 'POST' })
      .catch(err => console.error("Error escalating action:", err));
  };

  const displayState = isReplayMode 
    ? {
        ...liveState,
        tick: replayIndex,
        current_time: replayData[replayIndex]?.time || "09:00:00",
        zones: {
          ...liveState?.zones,
          "Z-01": {
            ...liveState?.zones?.["Z-01"],
            co_level: replayData[replayIndex]?.co_level || 15.0
          }
        },
        risk_level: replayData[replayIndex]?.risk_level || "SAFE",
        overall_risk_score: replayData[replayIndex]?.risk_score || 18,
        awaiting_approval: false,
        outcome: (replayIndex >= 56) ? {
          lead_time: preset === "OPERATIONAL_DRIFT" ? "47 minutes" : "35 minutes",
          workers_protected: preset === "OPERATIONAL_DRIFT" ? 8 : 12,
          downtime_avoided: preset === "OPERATIONAL_DRIFT" ? "₹20L+" : "₹35L+",
          production_impact_reduction: "70%",
          confidence: preset === "OPERATIONAL_DRIFT" ? 87.6 : 92.4,
          status: "CLOSED"
        } : null
      }
    : liveState;

  if (!displayState) {
    return (
      <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center text-slate-800 font-sans text-xs select-none">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-t-2 border-[#4F46E5] animate-spin mx-auto mb-3"></div>
          <span>Synchronizing SafetyAI Telemetry Server...</span>
        </div>
      </div>
    );
  }

  // Header state transition configuration
  const getHeaderMetrics = () => {
    let normalizedRisk = displayState.risk_level || "SAFE";
    if (displayState.risk_level === "EMERGENCY") normalizedRisk = "ACT";
    if (displayState.risk_level === "CLOSED") normalizedRisk = "RECOVERY";
    
    const isCritical = preset === "CRITICAL_ESCALATION";
    const leadTimeVal = isCritical ? "35m" : "47m";

    if (normalizedRisk === "SAFE") {
      return {
        risk: "🟢 Safe (Monitoring)",
        riskClass: "text-safety-green font-bold",
        timeRemaining: "Monitoring",
        leadTime: "--",
        actionPlan: "--"
      };
    } else if (normalizedRisk === "WATCH") {
      return {
        risk: "🟡 Alert (Leak Detected)",
        riskClass: "text-safety-yellow font-bold animate-pulse",
        timeRemaining: isCritical ? "21m" : "33m",
        leadTime: "Calculating...",
        actionPlan: "Pending"
      };
    } else if (normalizedRisk === "PREPARE") {
      return {
        risk: "🟠 Warning (Ignition Risk)",
        riskClass: "text-safety-orange font-bold",
        timeRemaining: isCritical ? "21m" : "33m",
        leadTime: leadTimeVal,
        actionPlan: "Plan A Candidate"
      };
    } else if (normalizedRisk === "ACT") {
      return {
        risk: "🔴 Critical (AI Suspend)",
        riskClass: "text-safety-red font-bold animate-pulse text-glow-red",
        timeRemaining: isCritical ? "9m" : "21m",
        leadTime: leadTimeVal,
        actionPlan: "Plan A"
      };
    } else if (normalizedRisk === "RECOVERY") {
      return {
        risk: "🟢 Resolved (Leak Prevented)",
        riskClass: "text-safety-green font-bold text-glow",
        timeRemaining: "Incident Avoided",
        leadTime: `Saved: ${leadTimeVal}`,
        actionPlan: "Successful"
      };
    }
    
    return { risk: "🟢 Safe (Monitoring)", riskClass: "text-safety-green", timeRemaining: "Monitoring", leadTime: "--", actionPlan: "--" };
  };

  const headerMetrics = getHeaderMetrics();
  const showAwaitingBanner = displayState.awaiting_approval;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-row select-none font-sans overflow-hidden">
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 flex-shrink-0 z-20 shadow-sm">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-200">
            <Shield className="text-[#4F46E5]" size={22} />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-slate-800 leading-none">SAFETYAI v2.0</h1>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Safety Intelligence</span>
            </div>
          </div>

          {/* Navigation views */}
          <nav className="flex flex-col space-y-1">
            {[
              { id: "OVERVIEW", label: "📊 Overview Status" },
              { id: "MAP", label: "🗺️ Plant Layout Map" },
              { id: "CHART", label: "📈 Predictive Trends" },
              { id: "DEBATE", label: "💬 Agent Multi-Debate" },
              { id: "REASONING", label: "📚 History & Root Cause" },
              { id: "CONFIDENCE", label: "⚙️ Confidence Matrix" },
              { id: "PERMITS", label: "📄 Active Permits" },
              { id: "REPLAY", label: "📺 Flight Recorder" },
              { id: "FEED", label: "💻 System Terminal" }
            ].map(view => {
              const isActive = activeView === view.id;
              
              let statusIndicator = "";
              const risk = displayState.risk_level || "SAFE";
              if (view.id === "DEBATE") {
                if (risk === "SAFE") statusIndicator = "standby";
                else if (risk === "WATCH") statusIndicator = "alert";
              } else if (view.id === "REASONING") {
                if (risk === "SAFE") statusIndicator = "standby";
                else if (risk === "WATCH") statusIndicator = "compiling";
              } else if (view.id === "REPLAY") {
                if (risk === "SAFE") statusIndicator = "inactive";
              }

              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-all font-semibold uppercase tracking-wider cursor-pointer ${
                    isActive 
                      ? "bg-[#4F46E5] text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{view.label}</span>
                    {statusIndicator && (
                      <span className={`text-[7.5px] px-1 py-0.2 rounded font-mono ${
                        isActive ? "text-white bg-white/20" : "text-slate-400 bg-slate-100"
                      }`}>
                        {statusIndicator}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-terminal-dim uppercase font-bold">Active Preset</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-center block">
              {preset === "OPERATIONAL_DRIFT" ? "Operational Drift" : "Critical Escalation"}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => sendControl(displayState.is_paused ? "resume" : "pause")}
              className="flex-grow py-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-black text-[10px] font-bold uppercase transition-all cursor-pointer text-center"
            >
              {displayState.is_paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => {
                sendControl("reset");
                setTimeout(() => {
                  window.location.reload();
                }, 300);
              }}
              className="flex-grow py-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] uppercase transition-all cursor-pointer text-center"
            >
              Reset
            </button>
          </div>

          <button
            onClick={() => {
              sendControl("reset");
              navigate('/dashboard');
            }}
            className="w-full py-1.5 mt-2 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[9.5px] uppercase font-bold text-center block transition-all"
          >
            ← Exit Simulator
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* DYNAMIC SAFETY STATUS BAR (ALWAYS VISIBLE AT TOP) */}
        <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex flex-col md:flex-row justify-between items-center text-xs select-none z-10 flex-shrink-0 shadow-sm font-sans">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-1 text-center md:text-left text-[11px] w-full">
            <div className="border-r border-slate-200 pr-6">
              <div className="text-slate-400 uppercase text-[9px] font-bold">Current Status</div>
              <div className={`font-bold text-xs ${headerMetrics.riskClass}`}>{headerMetrics.risk}</div>
            </div>
            <div className="border-r border-slate-200 pr-6">
              <div className="text-slate-400 uppercase text-[9px] font-bold">Time Remaining</div>
              <div className="font-bold text-slate-800 text-xs font-mono">{headerMetrics.timeRemaining}</div>
            </div>
            <div className="border-r border-slate-200 pr-6">
              <div className="text-slate-400 uppercase text-[9px] font-bold">Lead Time Saved</div>
              <div className="font-bold text-slate-800 text-xs font-mono">{headerMetrics.leadTime}</div>
            </div>
            <div className="border-r border-slate-200 pr-6">
              <div className="text-slate-400 uppercase text-[9px] font-bold">Action Plan</div>
              <div className="font-bold text-slate-800 text-xs">{headerMetrics.actionPlan}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase text-[9px] font-bold">Affected Zone</div>
              <div className="font-bold text-[#4F46E5] text-xs font-mono">
                {displayState.affected_zone || "Z-01"} ({displayState.sensor_name || "CO"})
              </div>
            </div>
          </div>
        </header>

        {/* SCENARIO INTERVENTION NOTIFICATION */}
        {showAwaitingBanner && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex justify-between items-center animate-pulse flex-shrink-0 z-10 font-sans">
            <div className="flex items-center space-x-2 text-rose-700">
              <ShieldAlert size={14} className="animate-bounce" />
              <span className="text-[10px] uppercase tracking-wider font-bold">
                Critical Safety Decision Blocked: Plans Pending Safety Officer Consent
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={approvePlan}
                className="px-3 py-0.5 rounded bg-safety-green text-white font-bold uppercase text-[9px] shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Approve Plan A
              </button>
              <button
                onClick={escalatePlan}
                className="px-3 py-0.5 rounded border border-safety-yellow text-safety-yellow font-bold uppercase text-[9px] hover:bg-safety-yellow/10 transition-colors cursor-pointer"
              >
                Escalate
              </button>
            </div>
          </div>
        )}

        <main className="flex-grow p-6 min-h-0 overflow-y-auto flex flex-col space-y-6">
          {/* Main Content View Heading with Descriptive Subtitles and Phase Badge */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
                {activeView === "OVERVIEW" ? "Overview Status"
                 : activeView === "MAP" ? "Plant Layout Map"
                 : activeView === "CHART" ? "Predictive Trends"
                 : activeView === "DEBATE" ? "Agent Multi-Debate"
                 : activeView === "REASONING" ? "History & Root Cause"
                 : activeView === "CONFIDENCE" ? "Confidence Matrix"
                 : activeView === "PERMITS" ? "Active Permits"
                 : activeView === "REPLAY" ? "Flight Recorder"
                 : activeView === "FEED" ? "System Terminal"
                 : "Safety Panel"}
              </h2>
              <span className="text-[10.5px] text-slate-500 font-sans block mt-0.5">
                {activeView === "OVERVIEW" ? "Real-time safety dashboard and mitigation cockpit"
                 : activeView === "MAP" ? "Geospatial telemetry and active permit monitoring"
                 : activeView === "CHART" ? "Forecasting future safety threshold breaches"
                 : activeView === "DEBATE" ? "Orchestration debate and consensus rationale"
                 : activeView === "REASONING" ? "Tracing evidence chain behind intervention"
                 : activeView === "CONFIDENCE" ? "Explaining model certainty and evidence quality"
                 : activeView === "PERMITS" ? "Compliance database of hot work and confined space permits"
                 : activeView === "REPLAY" ? "Incident scrubbing and transaction log player"
                 : activeView === "FEED" ? "Low-level multi-agent reasoning stream"
                 : ""}
              </span>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">PHASE:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                displayState.risk_level === "SAFE" ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : displayState.risk_level === "WATCH" ? "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse font-bold"
                : displayState.risk_level === "PREPARE" ? "bg-orange-50 text-orange-600 border border-orange-200"
                : displayState.risk_level === "ACT" || displayState.risk_level === "EMERGENCY" ? "bg-red-50 text-red-600 border border-red-200 animate-pulse font-bold"
                : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
                {displayState.risk_level}
              </span>
            </div>
          </div>

          {(() => {
            switch (activeView) {
              case "OVERVIEW":
                return (
                  <div className="flex flex-col space-y-6 select-none font-sans flex-grow">
                    {/* Severity Escalation Timeline Tracker (Full Width Banner) */}
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                      <RiskTimeline currentLevel={displayState.risk_level} />
                    </div>

                    {/* Simplified Cinematic Overview Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      
                      {/* Left Column: Plant Map + Context */}
                      <div className="flex flex-col space-y-6">
                        <div>
                          <PlantMap 
                            zones={displayState.zones} 
                            activeZone={activeZone} 
                            setActiveZone={setActiveZone}
                            permits={displayState.permits}
                            scenarioActive={displayState.scenario !== "NORMAL"}
                            workersPresent={displayState.workers_present}
                            ventilationStatus={displayState.ventilation_status}
                          />
                        </div>
                        <div>
                          <OperationalContextCard 
                            workersPresent={displayState.workers_present}
                            ventilationStatus={displayState.ventilation_status}
                            riskLevel={displayState.risk_level}
                            preset={preset}
                          />
                        </div>
                      </div>

                      {/* Right Column: Predictive Chart + Match */}
                      <div className="flex flex-col space-y-6">
                        <div>
                          <PredictionChart 
                            coHistory={displayState.co_history} 
                            coForecast={displayState.co_forecast}
                            riskLevel={displayState.risk_level}
                            sensorName={displayState.sensor_name}
                            sensorUnit={displayState.sensor_unit}
                            safetyThreshold={displayState.safety_threshold}
                            maxDomain={displayState.max_domain}
                            targetLabel={displayState.target_label}
                          />
                        </div>
                        <div>
                          <HistoricalMatchCard 
                            riskLevel={displayState.risk_level} 
                            match={displayState.historical_match} 
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              case "MAP":
                return (
                  <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
                    {/* Plant Map (70% Width) */}
                    <div className="flex-grow lg:w-[70%] h-full min-h-[400px]">
                      <PlantMap 
                        zones={displayState.zones} 
                        activeZone={activeZone} 
                        setActiveZone={setActiveZone}
                        permits={displayState.permits}
                        scenarioActive={displayState.scenario !== "NORMAL"}
                        workersPresent={displayState.workers_present}
                        ventilationStatus={displayState.ventilation_status}
                      />
                    </div>
                    {/* Context Sidebar (30% Width) */}
                    <div className="lg:w-[30%] flex-shrink-0 h-full min-h-[400px]">
                      <OperationalContextCard 
                        workersPresent={displayState.workers_present}
                        ventilationStatus={displayState.ventilation_status}
                        riskLevel={displayState.risk_level}
                        preset={preset}
                      />
                    </div>
                  </div>
                );
              case "CHART":
                return (
                  <div className="flex flex-col xl:flex-row gap-6 h-[80vh] select-none font-sans">
                    {/* Hero Chart Container (75% Width) */}
                    <div className="flex-grow xl:w-[75%] h-full bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col">
                      <div className="flex-grow h-full">
                        <PredictionChart 
                          coHistory={displayState.co_history} 
                          coForecast={displayState.co_forecast}
                          riskLevel={displayState.risk_level}
                          sensorName={displayState.sensor_name}
                          sensorUnit={displayState.sensor_unit}
                          safetyThreshold={displayState.safety_threshold}
                          maxDomain={displayState.max_domain}
                          targetLabel={displayState.target_label}
                        />
                      </div>
                    </div>
                    {/* Predictive Intelligence Dashboard Sidebar (25% Width) */}
                    <div className="xl:w-[25%] flex-shrink-0 flex flex-col space-y-4 h-full overflow-y-auto">
                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                            Breach Prediction
                          </span>
                          <div className="text-lg font-extrabold text-slate-800 font-mono tracking-tight">
                            {displayState.prediction_breach ? `${displayState.prediction_breach.time_str} IST` : "No Breach Projected"}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">
                          Projected limit breach time.
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                            Safety Threshold
                          </span>
                          <div className="text-lg font-extrabold text-rose-600 font-mono">
                            {displayState.safety_threshold} {displayState.sensor_unit}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">
                          Critical limit for regulatory shutdown.
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                            consensus Confidence
                          </span>
                          <div className="text-lg font-extrabold text-[#4F46E5] font-mono">
                            {displayState.confidence.overall}%
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">
                          consensus probability metric.
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                            Safety Lead Time
                          </span>
                          <div className="text-lg font-extrabold text-emerald-600 font-mono">
                            {displayState.lead_time_saved} Minutes
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">
                          Buffer gained by early actions.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              case "DEBATE":
                if (displayState.risk_level === "SAFE") {
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center py-24 min-h-[350px]">
                      <Cpu size={32} className="text-slate-300 mb-3 animate-pulse" />
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Multi-Agent Review Standby</h4>
                      <p className="text-[10px] text-slate-500 max-w-md mt-1 font-sans">
                        Compound risk threshold not reached. Multi-agent review remains inactive.
                      </p>
                    </div>
                  );
                }
                if (displayState.risk_level === "WATCH") {
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center py-24 min-h-[350px]">
                      <Cpu size={32} className="text-[#4F46E5]/40 mb-3 animate-spin-slow" />
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Review Pending Drift</h4>
                      <p className="text-[10px] text-slate-500 max-w-md mt-1 font-sans">
                        Awaiting critical drift levels. Multi-agent review remains inactive.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-full min-h-[350px]">
                    <DebatePanel 
                      debate={displayState.debate} 
                      awaitingApproval={displayState.awaiting_approval}
                      onApprove={approvePlan}
                      onEscalate={escalatePlan}
                      active={displayState.risk_level !== "SAFE"}
                    />
                  </div>
                );
              case "REASONING":
                return (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-[450px] select-none font-sans">
                    <div>
                      <HistoricalMatchCard 
                        riskLevel={displayState.risk_level} 
                        match={displayState.historical_match}
                      />
                    </div>
                    <div>
                      {displayState.risk_level === "SAFE" ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[350px] py-20">
                          <AlertTriangle size={32} className="text-slate-300 mb-3" />
                          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Reasoning Graph Offline</h4>
                          <p className="text-[10px] text-slate-500 max-w-xs mt-1 font-sans">
                            Awaiting incident context. No historical similarity queries executed.
                          </p>
                        </div>
                      ) : displayState.risk_level === "WATCH" ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[350px] py-20">
                          <Compass size={32} className="text-slate-300 mb-3 animate-spin-slow" />
                          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Causal Chain Compiling</h4>
                          <p className="text-[10px] text-slate-500 max-w-xs mt-1 font-sans">
                            Insufficient evidence chain for causal reconstruction.
                          </p>
                        </div>
                      ) : (
                        <RootCauseWaterfall 
                          waterfall={displayState.waterfall} 
                          sensorName={displayState.sensor_name}
                          permitId={displayState.scenario === "CONVEYOR_FIRE" || displayState.scenario === "CONFINED_SPACE" ? "CSP-1108" : "HWP-2241"}
                        />
                      )}
                    </div>
                  </div>
                );
              case "CONFIDENCE":
                const overallConf = displayState.confidence.overall || 87.6;
                const isCritical = preset === "CRITICAL_ESCALATION";
                const sensorContrib = isCritical ? 16.0 : 14.0;
                const permitContrib = isCritical ? 12.0 : 10.0;
                const trendContrib = 6.0;
                const histContrib = isCritical ? 6.4 : 5.6;

                return (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 select-none font-sans flex-grow">
                    <div>
                      <ConfidenceBreakdown confidence={displayState.confidence} />
                    </div>
                    {/* Visual model consensus attribution waterfall chart */}
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Consensus Attribution</span>
                          <span className="text-[9px] text-slate-400 font-mono tracking-widest">EXPLAINABLE AI PROVENANCE</span>
                        </div>
                        <p className="text-[10.5px] text-slate-550 mb-6 font-sans">
                          Consensus attribution metrics proving current aggregated confidence levels.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 font-sans">
                            <span className="font-semibold text-slate-700">Base Model Confidence</span>
                            <span className="font-mono font-bold text-slate-800">52.0%</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 text-emerald-600 font-sans">
                            <span>+ Sensor Agreement Factor</span>
                            <span className="font-mono font-bold font-sans">+{sensorContrib.toFixed(1)}%</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 text-emerald-600 font-sans">
                            <span>+ Permit Validation Scrutiny</span>
                            <span className="font-mono font-bold font-sans">+{permitContrib.toFixed(1)}%</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 text-emerald-600 font-sans">
                            <span>+ AI Forecasting Consistency</span>
                            <span className="font-mono font-bold font-sans">+{trendContrib.toFixed(1)}%</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 text-emerald-600 font-sans">
                            <span>+ Historical Similarity Match</span>
                            <span className="font-mono font-bold font-sans">+{histContrib.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-6 flex justify-between items-center font-sans shadow-inner">
                        <div>
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block leading-none">
                            FINAL consensus CONFIDENCE
                          </span>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            Weighted consensus rating of all analysis nodes
                          </span>
                        </div>
                        <span className="text-xl font-extrabold text-[#4F46E5] font-mono font-sans">
                          {overallConf}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              case "PERMITS":
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-full min-h-[350px]">
                    <PermitPanel permits={displayState.permits} />
                  </div>
                );
              case "REPLAY":
                if (displayState.risk_level === "SAFE") {
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center py-20 min-h-[250px]">
                      <Play size={32} className="text-slate-300 mb-3 animate-pulse" />
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Recorder Inactive</h4>
                      <p className="text-[10px] text-slate-500 max-w-md mt-1 font-sans">
                        No active incident recording available for current session.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-full min-h-[250px]">
                    <IncidentReplay 
                      isReplayMode={isReplayMode}
                      setIsReplayMode={setIsReplayMode}
                      replayIndex={replayIndex}
                      setReplayIndex={setReplayIndex}
                      replayData={replayData}
                    />
                  </div>
                );
              case "FEED":
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-full min-h-[350px]">
                    <AgentActivityFeed logs={displayState.logs} />
                  </div>
                );
              default:
                return null;
            }
          })()}
        </main>
      </div>

      {/* 4. INCIDENT OUTCOMES SUMMARY CARD DIALOG */}
      {displayState.outcome && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 font-sans">
          <div className="max-w-md w-full border border-safety-green/50 bg-white rounded-lg p-6 shadow-xl animate-pulseBorder">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-200">
              <Award className="text-safety-green animate-bounce" size={28} />
              <h2 className="text-base font-bold uppercase tracking-widest text-slate-800">Incident Outcomes Audit</h2>
            </div>

            <div className="space-y-4">
              <table className="w-full text-left text-[11px] text-slate-600 border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="p-2">METRIC</th>
                    <th className="p-2">TRADITIONAL SCADA</th>
                    <th className="p-2">WITH SAFETYAI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-700">Detection Time</td>
                    <td className="p-2 text-safety-red font-semibold">Post-breach</td>
                    <td className="p-2 text-safety-green font-bold">{displayState.outcome.lead_time} earlier</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-700">Response Mode</td>
                    <td className="p-2 text-slate-500">Reactive</td>
                    <td className="p-2 text-safety-green font-bold">Predictive</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-700">
                      Permit {displayState.scenario === "CONVEYOR_FIRE" || displayState.scenario === "CONFINED_SPACE" ? "CSP-1108" : "HWP-2241"}
                    </td>
                    <td className="p-2 text-slate-500">Still Active</td>
                    <td className="p-2 text-safety-green font-bold">Suspended</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-700">Downtime</td>
                    <td className="p-2 text-safety-red">₹20L+ Loss</td>
                    <td className="p-2 text-safety-green font-bold">Avoided</td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="p-2 font-bold text-emerald-950">Outcome</td>
                    <td className="p-2 text-safety-red font-bold uppercase">Explosion</td>
                    <td className="p-2 text-safety-green font-bold uppercase text-glow">CLOSED</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px]">
                <div className="text-slate-500 font-bold uppercase mb-1">Safety Audit Log:</div>
                <div className="text-slate-600">Potentially Exposed Workers Protected: <span className="text-slate-800 font-bold">{displayState.outcome.workers_protected}</span></div>
                <div className="text-slate-600">Estimated Downtime Avoided: <span className="text-slate-800 font-bold">{displayState.outcome.downtime_avoided}</span></div>
                <div className="text-slate-600">Projected Production Impact Reduction: <span className="text-slate-800 font-bold">{displayState.outcome.production_impact_reduction}</span></div>
              </div>

              <button 
                onClick={() => alert("Report compiled. Safety log synced to SQLite compliance history.")}
                className="w-full py-2 rounded bg-safety-green text-white font-bold uppercase text-[10px] hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                <span>Download Compliance Audit Summary</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-sans">
                Every industrial disaster had the data.
              </span>
              <span className="text-[10px] text-terminal-accent font-bold mt-0.5 block text-glow-blue animate-pulse">
                SafetyAI connects the reasoning.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. TOP LEVEL ROUTER APP
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingScreen />} />
        <Route path="/dashboard" element={<DashboardSelector />} />
        <Route path="/scenario/co-leak" element={<CommandCenter />} />
        <Route path="/scenario/ammonia-leak" element={<CommandCenter />} />
        <Route path="/scenario/conveyor-fire" element={<CommandCenter />} />
        <Route path="/scenario/boiler-overpressure" element={<CommandCenter />} />
        <Route path="/scenario/confined-space" element={<CommandCenter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
