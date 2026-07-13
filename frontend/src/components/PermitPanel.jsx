import React from 'react';
import { ShieldCheck, ShieldAlert, Ban } from 'lucide-react';

const PermitPanel = ({ permits }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full select-none font-sans text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Active Permit-to-Work Logs</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Permit registry logs</span>
        </div>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto">
        {Object.values(permits).map((permit) => {
          const isSuspended = permit.status.includes("SUSPENDED");
          
          return (
            <div 
              key={permit.id} 
              className={`relative border rounded-lg p-3 transition-all duration-300 overflow-hidden ${
                isSuspended 
                  ? "border-red-200 bg-red-50 text-slate-500" 
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
              }`}
            >
              {/* Suspended Red Banner Overlay */}
              {isSuspended && (
                <div className="absolute inset-0 bg-red-100/50 backdrop-blur-[1.5px] flex items-center justify-center animate-flash z-10 text-center font-sans">
                  <div className="border border-red-200 bg-red-50 px-3.5 py-2.5 rounded-lg shadow text-slate-900 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <Ban size={11} className="text-safety-red" />
                      <span className="text-red-750">SUSPENDED BY SAFETY OFFICER</span>
                    </div>
                    <span className="text-[8.5px] text-slate-550 normal-case font-medium">Mitigated by SafetyAI</span>
                    <span className="text-[8.5px] text-[#4F46E5] font-bold uppercase mt-0.5 leading-none">Latency: 11 seconds</span>
                  </div>
                </div>
              )}

              {/* Permit header */}
              <div className="flex justify-between items-center mb-1 font-sans">
                <span className={`font-bold font-mono ${isSuspended ? "text-slate-400" : "text-slate-800"}`}>
                  {permit.id}
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                  isSuspended 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-amber-50 text-amber-700 border border-amber-250"
                }`}>
                  {permit.type}
                </span>
              </div>

              {/* Permit Zone / Workers */}
              <div className="flex space-x-4 text-[9.5px] text-slate-500 mb-1 font-sans">
                <div>
                  ZONE: <span className="text-slate-850 font-bold font-mono">{permit.zone}</span>
                </div>
                <div>
                  CREW: <span className="text-slate-850 font-bold font-mono">{permit.workers} workers</span>
                </div>
              </div>

              {/* Permit Description */}
              <p className="text-[10px] text-slate-600 leading-normal mb-1 font-sans">
                {permit.description}
              </p>

              {/* Compliance status check */}
              <div className="flex items-center space-x-1 text-[8.5px] mt-2 font-sans">
                {isSuspended ? (
                  <>
                    <ShieldAlert size={11} className="text-safety-red" />
                    <span className="text-safety-red font-bold uppercase">Compliance Block Flagged</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={11} className="text-safety-green" />
                    <span className="text-safety-green font-bold uppercase">Active Compliance Check Ok</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermitPanel;
