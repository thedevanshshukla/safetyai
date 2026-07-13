import React, { useEffect, useRef } from 'react';

const AgentActivityFeed = ({ logs, onExpand, isZoomed }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom of local log container as new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentColor = (agent) => {
    switch (agent) {
      case "SensorAgent":
        return "text-emerald-700 font-bold";
      case "PredictionAgent":
        return "text-blue-700 font-bold";
      case "PermitAgent":
        return "text-amber-700 font-bold";
      case "ShiftAgent":
        return "text-pink-700 font-bold";
      case "MemoryAgent":
        return "text-purple-700 font-bold";
      case "PlannerAgent":
        return "text-indigo-700 font-bold";
      case "ValidatorAgent":
        return "text-cyan-700 font-bold";
      case "RecoveryAgent":
        return "text-teal-700 font-bold";
      case "System":
        return "text-slate-600 font-bold";
      default:
        return "text-terminal-accent font-bold";
    }
  };

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4 flex flex-col h-full font-sans text-xs select-none shadow-sm">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-terminal-accent">Agent Multi-Reasoning Activity Feed</span>
        <div className="flex items-center space-x-2">
          <span className="text-[8px] text-slate-500 uppercase">Live WebSocket Stream</span>
        </div>
      </div>

      {/* Terminal logs list */}
      <div 
        ref={containerRef}
        className={`flex-grow bg-slate-50 border border-slate-200 rounded-lg p-2.5 overflow-y-auto ${isZoomed ? "max-h-[500px]" : "max-h-[140px]"} space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent`}
      >
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start text-[10px] leading-relaxed select-text">
            <span className="text-slate-500 mr-2 flex-shrink-0">[{log.timestamp}]</span>
            <span className="flex-grow">
              <span className={`mr-1.5 ${getAgentColor(log.agent)}`}>
                [{log.agent}]
              </span>
              <span className="text-slate-700 font-medium">{log.message}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentActivityFeed;
