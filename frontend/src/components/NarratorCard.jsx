import React from 'react';
import { ShieldCheck, CheckSquare, ListTodo, AlertTriangle } from 'lucide-react';

const NarratorCard = ({ riskLevel, waterfall, statusMessage, officerAction, narratorText }) => {
  // Decision trace steps and active state calculation
  const traceSteps = [
    { label: "Sensor Agent", active: riskLevel !== "SAFE" },
    { label: "Permit Agent", active: riskLevel !== "SAFE" && riskLevel !== "WATCH" },
    { label: "Shift Agent", active: riskLevel !== "SAFE" && riskLevel !== "WATCH" },
    { label: "Memory Agent", active: riskLevel !== "SAFE" && riskLevel !== "WATCH" },
    { label: "Prediction Agent", active: riskLevel !== "SAFE" },
    { label: "Planner Agent", active: riskLevel === "PREPARE" || riskLevel === "ACT" || riskLevel === "EMERGENCY" || riskLevel === "RECOVERY" || riskLevel === "CLOSED" },
    { label: "Validator Agent", active: riskLevel === "PREPARE" || riskLevel === "ACT" || riskLevel === "EMERGENCY" || riskLevel === "RECOVERY" || riskLevel === "CLOSED" },
    { label: "Judge Agent", active: riskLevel === "ACT" || riskLevel === "EMERGENCY" || riskLevel === "RECOVERY" || riskLevel === "CLOSED" },
    { label: "Officer Approval", active: officerAction !== null },
    { label: "Action Execution", active: officerAction === "APPROVED" || riskLevel === "RECOVERY" || riskLevel === "CLOSED" }
  ];

  const showExplanation = riskLevel !== "SAFE";

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col h-full select-none font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-terminal-accent">SafetyAI Reasoning Narrator</span>
        </div>
        <span className="text-[9px] text-terminal-dim">AGENT: A8 NARRATOR & EXPLAINER</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
        {/* Left Column: Why did SafetyAI Intervene? */}
        <div className="flex flex-col">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
            <CheckSquare size={12} className="text-terminal-accent" />
            <span>Why did SafetyAI Intervene?</span>
          </div>

          {showExplanation ? (
            <div className="bg-slate-950/40 border border-slate-900 rounded p-3 flex-grow space-y-2 overflow-y-auto max-h-[170px] scrollbar-thin">
              {narratorText ? (
                <div className="space-y-2 text-[10px] leading-relaxed text-slate-300">
                  {narratorText.split('\n\n').map((para, i) => (
                    <p key={i} className="border-l-2 border-terminal-accent/30 pl-2">{para}</p>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-start space-x-2 text-[10px]">
                    <span className="text-safety-green font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-300">CO trend projected threshold breach in <span className="text-white font-bold">33 minutes</span></span>
                  </div>
                  <div className="flex items-start space-x-2 text-[10px]">
                    <span className="text-safety-green font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-300">Hot Work Permit <span className="text-white font-bold">HWP-2241</span> active in affected zone</span>
                  </div>
                  <div className="flex items-start space-x-2 text-[10px]">
                    <span className="text-safety-green font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-300">Shift change starts in <span className="text-white font-bold">7 minutes</span> (fatigue risk)</span>
                  </div>
                  <div className="flex items-start space-x-2 text-[10px]">
                    <span className="text-safety-green font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-300">Incident <span className="text-white font-bold">#23</span> matched with <span className="text-white font-bold">91% similarity</span></span>
                  </div>
                  <div className="flex items-start space-x-2 text-[10px]">
                    <span className="text-safety-green font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-300">OISD-105 safety regulations threshold violated</span>
                  </div>

                  <div className="border-t border-slate-900 pt-2 mt-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Recommended Action Plan:</span>
                    <p className="text-[10px] text-safety-green font-bold mt-0.5 leading-normal">
                      Suspend permit HWP-2241 immediately, dispatch maintenance, and increase extraction fan ventilation.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/20 border border-slate-900 border-dashed rounded p-5 flex items-center justify-center flex-grow text-center text-slate-600">
              <div>
                <ShieldCheck size={20} className="mx-auto mb-1 text-slate-800" />
                <span>Intervention rules standby.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Decision Trace */}
        <div className="flex flex-col">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
            <ListTodo size={12} className="text-terminal-accent" />
            <span>AI Decision Trace</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 rounded p-2 flex-grow grid grid-cols-2 gap-x-3 gap-y-1.5 justify-center items-center">
            {traceSteps.map((step) => (
              <div 
                key={step.label}
                className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-all duration-500 ${
                  step.active 
                    ? "bg-terminal-accent/10 border-terminal-accent/30 text-white font-bold" 
                    : "bg-slate-900/10 border-slate-900 text-slate-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${step.active ? "bg-terminal-accent animate-pulse" : "bg-slate-800"}`}></span>
                <span className="text-[9px] truncate">{step.label}</span>
                {step.active && <span className="text-terminal-accent font-bold text-[8px] ml-auto">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarratorCard;
