import React from 'react';
import { Shield, Eye, TrendingUp, ShieldAlert, ShieldCheck } from 'lucide-react';

const RiskTimeline = ({ currentLevel, onExpand, isZoomed }) => {
  const levels = [
    { name: "1. Monitoring", desc: "Standard Operations", val: "SAFE", icon: Shield },
    { name: "2. Drift Flagged", desc: "CO Level Rising", val: "WATCH", icon: Eye },
    { name: "3. Ignition Risk", desc: "Welder Permit Clash", val: "PREPARE", icon: TrendingUp },
    { name: "4. AI Action", desc: "Permit Suspension Alert", val: "ACT", icon: ShieldAlert },
    { name: "5. Secure", desc: "Purge Completed", val: "RECOVERY", icon: ShieldCheck }
  ];

  // Helper to determine active class
  const getStepStatus = (stepVal, idx) => {
    let normalizedCurrent = currentLevel;
    if (currentLevel === "EMERGENCY") normalizedCurrent = "ACT";
    if (currentLevel === "CLOSED") normalizedCurrent = "RECOVERY";

    const currentIdx = levels.findIndex(l => l.val === normalizedCurrent);
    if (currentIdx === -1) {
      if (currentLevel === "SAFE" && idx === 0) return "active";
      return "future";
    }

    if (idx < currentIdx) return "past";
    if (idx === currentIdx) return "active";
    return "future";
  };

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4 flex flex-col h-full select-none font-sans text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-accent font-sans">Severity Escalation Timeline Tracker</span>
        <div className="flex items-center space-x-2">
          <span className="text-[9.5px] text-terminal-dim uppercase font-bold">Status: {currentLevel}</span>
        </div>
      </div>

      <div className="relative flex items-center justify-between mt-2.5 px-4 flex-grow">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

        {/* Highlighted progress line */}
        <div 
          className="absolute top-1/2 left-8 h-0.5 bg-terminal-accent -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
          style={{
            width: `${
              currentLevel === "SAFE" ? 0 :
              currentLevel === "WATCH" ? 25 :
              currentLevel === "PREPARE" ? 50 :
              currentLevel === "ACT" || currentLevel === "EMERGENCY" ? 75 : 100
            }%`
          }}
        ></div>

        {/* Timeline Steps */}
        {levels.map((level, idx) => {
          const status = getStepStatus(level.val, idx);
          const IconComponent = level.icon;
          
          let circleColor = "bg-slate-100 border-slate-200 text-slate-400";
          let textColor = "text-slate-500";
          
          if (status === "active") {
            if (level.val === "ACT") {
              circleColor = "bg-safety-red border-red-500 text-white shadow-sm border-2 animate-pulse";
              textColor = "text-safety-red font-bold text-[11px]";
            } else if (level.val === "PREPARE") {
              circleColor = "bg-safety-orange border-orange-500 text-white border-2";
              textColor = "text-safety-orange font-bold text-[11px]";
            } else if (level.val === "SAFE") {
              circleColor = "bg-emerald-50 border-safety-green text-safety-green border-2 shadow-sm";
              textColor = "text-safety-green font-bold text-[11px]";
            } else {
              circleColor = "bg-[#4F46E5]/10 border-indigo-600 text-[#4F46E5] border-2 shadow-sm";
              textColor = "text-slate-800 font-bold text-[11px]";
            }
          } else if (status === "past") {
            circleColor = "bg-slate-50 border-terminal-accent text-terminal-accent";
            textColor = "text-slate-500";
          }

          return (
            <div key={level.val} className="flex flex-col items-center relative z-10 w-24 text-center">
              {/* Circle Marker Icon */}
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500 ${circleColor}`}>
                <IconComponent size={15} />
              </div>
              
              {/* Label */}
              <span className={`text-[10px] uppercase tracking-wider mt-2 transition-all duration-500 ${textColor}`}>
                {level.name}
              </span>

              {/* Subtitle desc */}
              <span className="text-[8px] text-slate-400 mt-1 max-w-[80px] leading-tight hidden md:inline">
                {level.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskTimeline;
