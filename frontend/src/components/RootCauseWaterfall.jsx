import React from 'react';
import { ChevronDown } from 'lucide-react';

const RootCauseWaterfall = ({ waterfall, sensorName = "CO", permitId = "HWP-2241", onExpand, isZoomed }) => {
  const steps = [
    { key: "co_rise", label: `${sensorName} Telemetry Rising`, sub: `Sensor detects ${sensorName} level anomaly trend`, icon: "📈" },
    { key: "permit_conflict", label: "Permit Operation Conflict", sub: `Active permit ${permitId} inside risk zone`, icon: "⚡" },
    { key: "shift_change", label: "Shift Change Window Active", sub: "Shift handoff communication hazard window", icon: "⏳" },
    { key: "historical_match", label: "Incident History Overlap", sub: "Database incident correlation match found", icon: "📚" },
    { key: "threshold_breach", label: "Predicted Threshold Breach", sub: f => `Predicted safety threshold breach imminent`, icon: "🔮" },
    { key: "recommended_action", label: "Intervention Selected", sub: "Plan A: Selective permit suspension proposal", icon: "✓" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full select-none font-sans shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Causal Reasoning Waterfall</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Real-time reasoning cascade</span>
        </div>
        <div className="flex items-center space-x-2">
          {!isZoomed && onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="text-[8px] bg-slate-900 border border-slate-800 text-[#38BDF8] hover:text-white px-1.5 py-0.5 rounded font-bold uppercase cursor-pointer"
            >
              🔎 Zoom
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2 flex-grow justify-between">
        {steps.map((step, idx) => {
          const item = waterfall[step.key] || { status: "inactive" };
          const isActive = item.status === "active";
          
          let borderStyle = "border-slate-200 bg-slate-50 text-slate-700";
          let badgeStyle = "bg-slate-200 text-slate-600";
          
          if (isActive) {
            if (step.key === "recommended_action") {
              borderStyle = "border-emerald-500 bg-emerald-50 text-slate-850 shadow-sm";
              badgeStyle = "bg-emerald-500 text-white font-bold";
            } else if (step.key === "threshold_breach") {
              borderStyle = "border-rose-500 bg-rose-50 text-slate-850 shadow-sm";
              badgeStyle = "bg-rose-500 text-white font-bold animate-pulse";
            } else {
              borderStyle = "border-[#4F46E5]/40 bg-indigo-50/50 text-slate-850 shadow-sm";
              badgeStyle = "bg-[#4F46E5] text-white font-bold";
            }
          }

          const descText = typeof step.sub === "function" ? step.sub() : step.sub;

          return (
            <React.Fragment key={step.key}>
              <div className={`border rounded-lg p-2.5 flex items-center justify-between transition-all duration-300 ${borderStyle}`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="text-sm">{step.icon}</span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold tracking-tight uppercase leading-none text-slate-800">{step.label}</div>
                    <div className="text-[8.5px] text-slate-500 mt-1 truncate">{descText}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${badgeStyle}`}>
                    {isActive ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ChevronDown size={12} className={`${isActive ? "text-[#4F46E5]/60 animate-bounce" : "text-slate-300"}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default RootCauseWaterfall;
