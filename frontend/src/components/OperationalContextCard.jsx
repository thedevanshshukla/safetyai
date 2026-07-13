import React from 'react';
import { Compass, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const OperationalContextCard = ({ workersPresent, ventilationStatus, riskLevel, preset, scenario, affectedZone }) => {
  const isCritical = preset === "CRITICAL_ESCALATION";
  
  // Normalized risk levels
  let normalizedRisk = riskLevel || "SAFE";
  if (riskLevel === "EMERGENCY") normalizedRisk = "ACT";
  if (riskLevel === "CLOSED") normalizedRisk = "RECOVERY";

  // Determine Plant Location & System details from the active scenario config
  let plantName = "Vizag Steel Plant";
  let systemName = "Coke Oven Battery Z-01";
  let permitId = "HWP-2241 (Hot Work)";
  
  if (scenario === "AMMONIA_LEAK") {
    plantName = "Vizag Ammonia Storage";
    systemName = "Fertilizer Tank Z-07";
    permitId = "HWP-2241 (Hot Work)";
  } else if (scenario === "CONVEYOR_FIRE") {
    plantName = "Sinter Processing Plant";
    systemName = "Raw Feed Conveyor Z-04";
    permitId = "CSP-1108 (Combustible)";
  } else if (scenario === "BOILER_OVERPRESSURE") {
    plantName = "BF Power & Utility Unit";
    systemName = "Steam Boiler Z-02";
    permitId = "HWP-2241 (Hot Work)";
  } else if (scenario === "CONFINED_SPACE" || scenario === "OXYGEN_DEFICIENCY") {
    plantName = "Coal Storage Depot";
    systemName = "Hopper Bunker Z-03";
    permitId = "CSP-1108 (Confined Space)";
  }

  // Evolving operational parameters based on state lifecycle
  let cardTitle = "Context: Normal Monitoring";
  let permitStatus = "ACTIVE";
  let permitBadgeClass = "bg-amber-50 text-amber-700 border-amber-200 border";
  let ventVal = isCritical ? "CRITICAL (20%)" : "DEGRADED (40%)";
  let ventClass = "text-orange-600";
  let workersVal = isCritical ? "12 Workers" : "8 Workers";
  let workersClass = "text-slate-800";
  let evacStatus = "NONE";
  let evacBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
  let supervisorVal = "ACTIVE PRESENT";
  let supervisorClass = "text-emerald-600 font-bold";

  if (normalizedRisk === "WATCH" || normalizedRisk === "PREPARE") {
    cardTitle = "Context: Anomaly Drift";
    permitStatus = "SPARK IGNITION RISK";
    permitBadgeClass = "bg-orange-50 text-orange-700 border border-orange-200 animate-pulse";
  } else if (normalizedRisk === "ACT") {
    cardTitle = "Context: Active Mitigation";
    permitStatus = "SUSPENDED BY SAFETYAI";
    permitBadgeClass = "bg-red-50 text-red-650 border border-red-200 animate-flash font-bold";
    ventVal = "100% (PURGE RAMPED)";
    ventClass = "text-indigo-600 font-bold animate-pulse";
    workersVal = "0 (EVACUATED)";
    workersClass = "text-red-600 font-bold";
    evacStatus = "COMPLETED";
    evacBadgeClass = "bg-red-100 text-red-700 border border-red-200 animate-pulse font-bold";
    supervisorVal = "EVACUATION DRILL ORDERED";
    supervisorClass = "text-orange-600 font-bold";
  } else if (normalizedRisk === "RECOVERY") {
    cardTitle = "Context: Post-Intervention";
    permitId = "Closed (Safe Purge)";
    permitStatus = "CLOSED";
    permitBadgeClass = "bg-slate-100 text-slate-500 border border-slate-200";
    ventVal = "NORMAL (100%)";
    ventClass = "text-emerald-600 font-bold";
    workersVal = "0 (Returned to Depot)";
    workersClass = "text-slate-500";
    evacStatus = "COMPLETED";
    evacBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
    supervisorVal = "POST-INCIDENT AUDITING";
    supervisorClass = "text-slate-500";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full select-none font-sans text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Compass size={14} className="text-[#4F46E5] animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Operational Context HUD</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wider">HUD: STATE-AWARE</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-around py-1 space-y-2.5 text-[11px]">
        {/* Environment Title */}
        <div className="text-[10px] text-slate-800 font-bold uppercase tracking-wider leading-none mb-1 text-center bg-slate-50 py-2 border border-slate-200 rounded-lg">
          {cardTitle}
        </div>

        {/* Location / System Static Metadata */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 border-b border-slate-200 pb-3">
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Location</span>
            <span className="text-slate-800 font-bold truncate block">{plantName}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">System</span>
            <span className="text-slate-800 font-bold truncate block">{systemName}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Current Shift</span>
            <span className="text-slate-800 font-bold truncate block">Evening handover</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Supervisor</span>
            <span className={supervisorClass}>{supervisorVal}</span>
          </div>
        </div>

        {/* Evolving State Metrics */}
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-bold block mb-1">Active Permit</span>
            <div className="flex justify-between items-center bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
              <span className="text-slate-800 font-bold truncate text-[10.5px] pr-2 font-mono">{permitId}</span>
              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${permitBadgeClass}`}>
                {permitStatus}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold text-[9.5px] uppercase">Ventilation:</span>
            <span className={`font-bold ${ventClass}`}>{ventVal}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold text-[9.5px] uppercase">Crew Count:</span>
            <span className={`font-bold ${workersClass}`}>{workersVal}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold text-[9.5px] uppercase">Evacuation drill:</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${evacBadgeClass}`}>
              {evacStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalContextCard;
