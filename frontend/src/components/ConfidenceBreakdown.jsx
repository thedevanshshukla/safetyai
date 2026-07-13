import React from 'react';

const ConfidenceBreakdown = ({ confidence }) => {
  const items = [
    { key: "sensor", label: "Real-Time Sensor Health", val: confidence.sensor, desc: "Real-time polling accuracy checks" },
    { key: "historical", label: "Incident Database Match", val: confidence.historical, desc: "Operational memory search match confidence" },
    { key: "permit", label: "Active Permit Risk Scrutiny", val: confidence.permit, desc: "Active permit safety checklist validation" },
    { key: "shift", label: "Human Fatigue Correlation", val: confidence.shift, desc: "Roster shift-gap safety correlation margin" },
    { key: "prediction", label: "AI Forecasting Certainty", val: confidence.prediction, desc: "Predictive trend extrapolation model fit" }
  ];

  const overallScore = confidence.overall || confidence.overall_confidence || 87.6;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full select-none font-sans shadow-sm">
      <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">System Confidence Matrix</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Statistical certainty indicators</span>
        </div>
        <div>
          <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-200 text-[#4F46E5] px-2 py-0.5 rounded font-bold">
            MEAN: {overallScore}%
          </span>
        </div>
      </div>

      <div className="space-y-4 flex-grow flex flex-col justify-around">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col space-y-1 font-sans">
            <div className="flex justify-between text-[10px] uppercase tracking-wider">
              <span className="text-slate-800 font-bold truncate pr-2">{item.label}</span>
              <span className="text-[#4F46E5] font-mono font-bold">{item.val}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-[#4F46E5] transition-all duration-500 ease-out" 
                style={{ width: `${item.val}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-400 leading-none block font-sans">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
