import React, { useState } from 'react';

const PlantMap = ({ zones, activeZone, setActiveZone, permits, scenarioActive, workersPresent, ventilationStatus, onExpand, isZoomed }) => {
  const [hoveredZone, setHoveredZone] = useState(null);

  // SVG dimensions
  const width = 800;
  const height = 450;

  // Define layout coordinates for 8 zones
  const zoneLayouts = {
    "Z-01": { x: 100, y: 80, w: 180, h: 100, label: "Coke Oven Battery Z-01", color: "safety-green" },
    "Z-02": { x: 340, y: 80, w: 180, h: 100, label: "Blast Furnace Z-02", color: "safety-green" },
    "Z-03": { x: 580, y: 80, w: 160, h: 100, label: "Coal Handling Z-03", color: "safety-green" },
    "Z-04": { x: 100, y: 260, w: 160, h: 100, label: "Sinter Plant Z-04", color: "safety-green" },
    "Z-05": { x: 300, y: 260, w: 180, h: 100, label: "Steel Melting SMS-02", color: "safety-green" },
    "Z-06": { x: 520, y: 260, w: 140, h: 100, label: "Rolling Mill RM-01", color: "safety-green" },
    "Z-07": { x: 280, y: 190, w: 140, h: 50, label: "Gas Holder Area", color: "safety-green" },
    "Z-08": { x: 450, y: 190, w: 140, h: 50, label: "Maintenance Depot", color: "safety-green" }
  };

  // Map risk level to Tailwind color/stroke
  const getRiskColor = (zoneId, details) => {
    const score = details.risk_score || 0;
    const status = details.status || "SAFE";
    
    if (zoneId === "Z-01" && status !== "SAFE") {
      if (status === "WATCH") return { fill: "rgba(245, 158, 11, 0.15)", stroke: "#F59E0B", shadow: "glow-yellow", labelColor: "text-safety-yellow" };
      if (status === "PREPARE") return { fill: "rgba(249, 115, 22, 0.25)", stroke: "#F97316", shadow: "glow-orange", labelColor: "text-safety-orange" };
      if (status === "ACT" || status === "EMERGENCY") return { fill: "rgba(239, 68, 68, 0.35)", stroke: "#EF4444", shadow: "glow-red animate-pulseBorder", labelColor: "text-safety-red text-glow-red" };
      if (status === "RECOVERY") return { fill: "rgba(16, 185, 129, 0.2)", stroke: "#10B981", shadow: "glow-green", labelColor: "text-safety-green" };
    }
    
    if (score < 25) return { fill: "rgba(16, 185, 129, 0.08)", stroke: "#10B981", shadow: "", labelColor: "text-safety-green" };
    if (score < 50) return { fill: "rgba(245, 158, 11, 0.08)", stroke: "#F59E0B", shadow: "glow-yellow", labelColor: "text-safety-yellow" };
    if (score < 75) return { fill: "rgba(249, 115, 22, 0.12)", stroke: "#F97316", shadow: "glow-orange", labelColor: "text-safety-orange" };
    return { fill: "rgba(239, 68, 68, 0.2)", stroke: "#EF4444", shadow: "glow-red", labelColor: "text-safety-red" };
  };

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4 relative flex flex-col h-full select-none shadow-sm">
      {/* Title */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-safety-green animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-terminal-accent font-mono">Geospatial Plant Layout Telemetry</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-terminal-dim font-mono">GRID: 8-ZONE COMPRESSED GRAPH</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-grow flex items-center justify-center border border-slate-900 bg-black/40 rounded overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className={`w-full h-auto ${isZoomed ? "max-h-[580px]" : "max-h-[380px]"}`}
        >
          {/* Defs for grid and gradients */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30, 41, 59, 0.15)" strokeWidth="1" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1E293B" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Gas Pipelines / KG Connections */}
          <g opacity="0.35">
            {/* Z-03 (Coal) -> Z-01 (Coke Oven) */}
            <path d="M 660 180 L 660 220 L 190 220 L 190 180" fill="none" stroke="#1E293B" strokeWidth="3" markerEnd="url(#arrow)" />
            {/* Z-01 (Coke Oven) -> Z-07 (Gas Holder) */}
            <path d="M 220 180 L 220 215 L 280 215" fill="none" stroke="#1E293B" strokeWidth="3" markerEnd="url(#arrow)" />
            {/* Z-07 (Gas Holder) -> Z-02 (Blast Furnace) */}
            <path d="M 350 190 L 350 215 Z" fill="none" stroke="#1E293B" strokeWidth="3" />
            <path d="M 350 190 L 400 190 L 400 180" fill="none" stroke="#1E293B" strokeWidth="3" markerEnd="url(#arrow)" />
            {/* Z-02 (Blast Furnace) -> Z-05 (SMS) */}
            <path d="M 430 180 L 430 260" fill="none" stroke="#1E293B" strokeWidth="3" markerEnd="url(#arrow)" />
            {/* Z-05 (SMS) -> Z-06 (Rolling Mill) */}
            <path d="M 480 310 L 520 310" fill="none" stroke="#1E293B" strokeWidth="3" markerEnd="url(#arrow)" />
          </g>

          {/* Render Zones */}
          {Object.entries(zoneLayouts).map(([id, layout]) => {
            const details = zones[id] || { co_level: 0, risk_score: 0, status: "SAFE" };
            const style = getRiskColor(id, details);
            const isSelected = activeZone === id;
            const isHovered = hoveredZone === id;
            
            // Check if there is an active permit in this zone
            const hasPermits = Object.values(permits).filter(p => p.zone === id && p.status !== "INACTIVE");

            return (
              <g
                key={id}
                className="cursor-pointer"
                onClick={() => setActiveZone(id)}
                onMouseEnter={() => setHoveredZone(id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Zone Area Glow */}
                <rect
                  x={layout.x - 3}
                  y={layout.y - 3}
                  width={layout.w + 6}
                  height={layout.h + 6}
                  rx={8}
                  fill="none"
                  stroke={isSelected ? "#38BDF8" : "transparent"}
                  strokeWidth={2}
                  opacity={isSelected ? 0.8 : 0}
                  className="transition-all duration-300"
                />

                {/* Main Zone Box */}
                <rect
                  x={layout.x}
                  y={layout.y}
                  width={layout.w}
                  height={layout.h}
                  rx={6}
                  fill={style.fill}
                  stroke={isSelected ? "#38BDF8" : style.stroke}
                  strokeWidth={isHovered || isSelected ? 2 : 1.2}
                  className="transition-all duration-300"
                />

                {/* Evacuation Highlight Overlay */}
                {id === "Z-01" && (details.status === "ACT" || details.status === "EMERGENCY") && (
                  <rect
                    x={layout.x}
                    y={layout.y}
                    width={layout.w}
                    height={layout.h}
                    rx={6}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={3}
                    className="animate-flash"
                  />
                )}

                {/* Zone Header / Label */}
                <text
                  x={layout.x + 10}
                  y={layout.y + 20}
                  fill="#0F172A"
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono tracking-tight"
                >
                  {id}: {id === "Z-01" ? "Coke Oven Battery" : id === "Z-02" ? "Blast Furnace" : layout.label.split(" ").slice(0, -1).join(" ")}
                </text>

                {/* Gas/Telem Value */}
                <text
                  x={layout.x + 10}
                  y={layout.y + 45}
                  fill={style.stroke}
                  fontSize="16"
                  fontWeight="bold"
                  className="font-mono text-glow font-bold"
                >
                  {details.co_level !== undefined ? `${details.co_level} ppm` : "N/A"}
                </text>

                {/* Risk score indicator */}
                <text
                  x={layout.x + 10}
                  y={layout.y + 65}
                  fill="#475569"
                  fontSize="9"
                  className="font-mono uppercase tracking-wider"
                >
                  RISK INDEX: <tspan fill={style.stroke} fontWeight="bold">{details.risk_score}%</tspan>
                </text>

                {/* Active permit markers inside zone */}
                {hasPermits.map((p, idx) => (
                  <g key={p.id} transform={`translate(${layout.x + layout.w - 30 - idx * 18}, ${layout.y + layout.h - 22})`}>
                    <rect
                      width="14"
                      height="14"
                      rx="3"
                      fill={p.status.includes("SUSPENDED") ? "#EF4444" : "#F59E0B"}
                      opacity="0.9"
                    />
                    <text
                      x="7"
                      y="11"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {p.type[0]}
                    </text>
                  </g>
                ))}

                {/* Worker icon / coordinate indicator (Repositioned to middle-right to avoid title overlap) */}
                <g transform={`translate(${layout.x + layout.w - 35}, ${layout.y + 36})`} opacity="0.8">
                  <circle cx="8" cy="6" r="3.5" fill="#4F46E5" />
                  <path d="M 2 13 C 2 10 5 9 8 9 C 11 9 14 10 14 13 Z" fill="#4F46E5" />
                  <text x="18" y="11" fill="#475569" fontSize="10" fontWeight="bold" className="font-mono">
                    {id === "Z-01" ? (workersPresent || 4) : id === "Z-03" ? 3 : 2}
                  </text>
                </g>

                {/* Evacuation Alert Text Overlay */}
                {id === "Z-01" && (details.status === "ACT" || details.status === "EMERGENCY") && (
                  <g transform={`translate(${layout.x + layout.w/2}, ${layout.y + layout.h/2 + 25})`}>
                    <rect
                      x="-55"
                      y="-10"
                      width="110"
                      height="16"
                      rx="4"
                      fill="#EF4444"
                      className="animate-pulse"
                    />
                    <text
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                      className="font-mono uppercase tracking-widest"
                    >
                      EVACUATION ALERT
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex justify-between items-center text-[10px] text-terminal-dim font-mono mt-3 border-t border-slate-200 pt-2">
        <div className="flex space-x-3">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-safety-green/20 border border-safety-green block"></span>
            <span>Safe (&lt;25%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-safety-yellow/20 border border-safety-yellow block"></span>
            <span>Watch (25-50%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-safety-orange/20 border border-safety-orange block"></span>
            <span>Prepare (50-75%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-safety-red/20 border border-safety-red block"></span>
            <span>Act (&gt;75%)</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <span>[H] Hot Work</span>
          <span>[C] Confined Space</span>
        </div>
      </div>
    </div>
  );
};

export default PlantMap;
