import React from 'react';

const RiskMeter = ({ score, riskLevel }) => {
  // Calculate SVG stroke offset for a circle with radius 50
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color matching risk status
  const getMeterColor = (level) => {
    switch (level) {
      case "SAFE":
        return { stroke: "#10B981", bgGlow: "rgba(16, 185, 129, 0.15)", text: "text-safety-green" };
      case "WATCH":
        return { stroke: "#F59E0B", bgGlow: "rgba(245, 158, 11, 0.15)", text: "text-safety-yellow" };
      case "INVESTIGATE":
        return { stroke: "#F59E0B", bgGlow: "rgba(245, 158, 11, 0.2)", text: "text-safety-yellow" };
      case "PREPARE":
        return { stroke: "#F97316", bgGlow: "rgba(249, 115, 22, 0.25)", text: "text-safety-orange" };
      case "ACT":
      case "EMERGENCY":
        return { stroke: "#EF4444", bgGlow: "rgba(239, 68, 68, 0.4)", text: "text-safety-red text-glow-red animate-pulse" };
      case "RECOVERY":
        return { stroke: "#10B981", bgGlow: "rgba(16, 185, 129, 0.2)", text: "text-safety-green" };
      case "CLOSED":
        return { stroke: "#10B981", bgGlow: "rgba(16, 185, 129, 0.2)", text: "text-safety-green" };
      default:
        return { stroke: "#10B981", bgGlow: "rgba(16, 185, 129, 0.15)", text: "text-safety-green" };
    }
  };

  const theme = getMeterColor(riskLevel);

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col items-center justify-center h-full relative overflow-hidden select-none">
      {/* Title */}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-terminal-dim font-mono mb-2 self-start">
        Overall Safety Index
      </span>

      {/* Circle Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Glow effect in background */}
        <div
          className="absolute inset-4 rounded-full filter blur-md transition-all duration-500"
          style={{ backgroundColor: theme.bgGlow }}
        ></div>

        <svg className="w-full h-full transform -rotate-90">
          {/* Base gray circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.15)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center values */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-mono font-bold leading-none select-all text-white">
            {score}%
          </span>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider mt-1 ${theme.text}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Level bar status */}
      <div className="w-full mt-3 grid grid-cols-5 gap-1 text-[8px] font-mono uppercase tracking-widest text-center text-terminal-dim">
        <div className={`py-0.5 rounded ${riskLevel === "SAFE" ? "bg-safety-green/20 text-safety-green font-bold" : "bg-black/20"}`}>Safe</div>
        <div className={`py-0.5 rounded ${riskLevel === "WATCH" ? "bg-safety-yellow/20 text-safety-yellow font-bold" : "bg-black/20"}`}>Watch</div>
        <div className={`py-0.5 rounded ${riskLevel === "PREPARE" ? "bg-safety-orange/20 text-safety-orange font-bold" : "bg-black/20"}`}>Prep</div>
        <div className={`py-0.5 rounded ${riskLevel === "ACT" || riskLevel === "EMERGENCY" ? "bg-safety-red/20 text-safety-red font-bold" : "bg-black/20"}`}>Act</div>
        <div className={`py-0.5 rounded ${riskLevel === "RECOVERY" || riskLevel === "CLOSED" ? "bg-safety-green/20 text-safety-green font-bold" : "bg-black/20"}`}>Recov/Closed</div>
      </div>
    </div>
  );
};

export default RiskMeter;
