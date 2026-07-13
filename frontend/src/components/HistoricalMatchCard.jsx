import React from 'react';
import { History, ShieldAlert } from 'lucide-react';

const HistoricalMatchCard = ({ riskLevel, match, onExpand, isZoomed }) => {
  // Always show matching cards if risk level is not SAFE, or if a match is actively provided
  const showMatch = riskLevel !== "SAFE" && !!match;
  
  const incident = match || {
    id: "INC-2024-023",
    name: "Valve Degradation CO Accumulation",
    similarity: 91,
    date: "12 MARCH 2024",
    zone: "Z-01 COKE OVEN",
    root_cause: "Flange wear and exhaust valve weld degradation triggers methane/CO accumulation during shift changes.",
    response: "SCADA alarms did not trigger. Evacuation ordered manually 14 minutes post-breach.",
    outcome: "Near-miss evacuation. High maintenance repair downtime (48 hours).",
    insight: "Prioritizing Plan A avoids welding spark ignitions flagged in the previous incident."
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full select-none font-sans text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Historical Database Correlation</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Incident pattern-matching model</span>
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

      <div className="flex-grow flex flex-col justify-center">
        {showMatch ? (
          <div className="border border-blue-200/60 bg-blue-50/20 rounded-lg p-4 relative overflow-hidden transition-all duration-300">
            {/* Top match header */}
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-[11px] flex items-center space-x-1.5">
                <History size={13} className="text-[#4F46E5]" />
                <span className="font-mono">{incident.id}</span>
                <span className="text-slate-500 font-normal">({incident.name})</span>
              </span>
              <span className="text-[9px] font-bold text-[#4F46E5] bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded leading-none font-sans">
                {incident.similarity}% SIMILARITY
              </span>
            </div>

            {/* Incident Metadata */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-3 border-b border-slate-100 pb-2">
              <div>
                INCIDENT DATE: <span className="text-slate-800 font-bold font-mono">{incident.date}</span>
              </div>
              <div>
                PLANT ZONE: <span className="text-slate-800 font-bold font-mono">{incident.zone}</span>
              </div>
            </div>

            {/* Dynamic Details from the RAG database match */}
            <div className="space-y-3 text-[11px] leading-relaxed">
              <p className="text-slate-700">
                <span className="text-slate-500 font-bold uppercase text-[9px] block tracking-wider mb-0.5">Root Cause:</span> 
                {incident.root_cause}
              </p>
              <p className="text-slate-700">
                <span className="text-slate-500 font-bold uppercase text-[9px] block tracking-wider mb-0.5">Traditional Response:</span> 
                {incident.response}
              </p>
              <p className="text-slate-700">
                <span className="text-slate-500 font-bold uppercase text-[9px] block tracking-wider mb-0.5">Outcome:</span> 
                {incident.outcome}
              </p>
            </div>

            {/* Key safety insight badge */}
            <div className="mt-4 flex items-start space-x-2.5 bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-[10px] leading-normal font-medium">
              <ShieldAlert size={14} className="text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold block uppercase text-[8.5px] text-rose-950 tracking-wider mb-0.5">Preventative Insight:</span>
                {incident.insight}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <History className="mx-auto text-slate-300 mb-2.5" size={26} />
            <span className="text-xs uppercase tracking-wider block font-bold text-slate-650">Awaiting incident context</span>
            <span className="block text-[10px] mt-1 text-slate-400 font-sans">No historical similarity queries executed for the current phase.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalMatchCard;
