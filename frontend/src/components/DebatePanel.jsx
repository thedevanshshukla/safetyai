import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let index = 0;
    const words = text.split(" ");
    
    const interval = setInterval(() => {
      if (index < words.length) {
        const nextWord = words[index];
        setDisplayedText((prev) => (prev ? prev + " " + nextWord : nextWord));
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

const DebatePanel = ({ debate, awaitingApproval, onApprove, onEscalate, active, onExpand, isZoomed }) => {
  const [stage, setStage] = useState(0); // 0: idle, 1: streaming voices, 2: streaming judge, 3: completed

  useEffect(() => {
    if (active && debate && debate.active) {
      setStage(1);
    } else {
      setStage(0);
    }
  }, [active, debate]);

  const riskText = debate?.risk_voice?.[0]?.text || "";
  const costText = debate?.cost_voice?.[0]?.text || "";
  const safetyText = debate?.safety_voice?.[0]?.text || "";
  const judgeText = debate?.judge_verdict || "";

  if (!active || !debate || !debate.active) {
    return (
      <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4 flex items-center justify-center h-full text-center select-none font-mono shadow-sm">
        <div className="text-terminal-dim">
          <span className="block text-2xl mb-2">⚡</span>
          <span className="text-xs uppercase tracking-wider">Agent Debate Standby</span>
          <span className="block text-[10px] mt-1 text-slate-400">Triggers when Compound Risk &gt; 75%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-panel border border-rose-200 bg-rose-50/10 rounded-lg p-4 flex flex-col h-full overflow-y-auto relative font-mono text-xs shadow-sm">
      {/* Title */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Agent Debate Layer Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-terminal-dim font-mono">POLICY: RISK VS COST VS SAFETY</span>
        </div>
      </div>

      {/* Three Voice Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Risk Column */}
        <div className="bg-red-50 border border-red-200/60 rounded-lg p-2.5 flex flex-col min-h-[120px]">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safety-red"></span>
            <span className="font-bold text-safety-red text-[10px] uppercase">Safety Engineer Agent</span>
          </div>
          <div className="text-slate-700 leading-relaxed text-[11px] flex-grow">
            {stage >= 1 && (
              <TypewriterText 
                text={riskText} 
                delay={15} 
                onComplete={() => stage === 1 && setStage(2)}
              />
            )}
          </div>
        </div>

        {/* Cost Column */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 flex flex-col min-h-[120px]">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safety-yellow"></span>
            <span className="font-bold text-safety-yellow text-[10px] uppercase">Operations Manager Agent</span>
          </div>
          <div className="text-slate-700 leading-relaxed text-[11px] flex-grow">
            {stage >= 1 && (
              <TypewriterText 
                text={costText} 
                delay={15}
              />
            )}
          </div>
        </div>

        {/* Safety Column */}
        <div className="bg-blue-50 border border-blue-200/60 rounded-lg p-2.5 flex flex-col min-h-[120px]">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent"></span>
            <span className="font-bold text-terminal-accent text-[10px] uppercase">Regulatory Officer Agent</span>
          </div>
          <div className="text-slate-700 leading-relaxed text-[11px] flex-grow">
            {stage >= 1 && (
              <TypewriterText 
                text={safetyText} 
                delay={15}
              />
            )}
          </div>
        </div>
      </div>

      {/* Judge Agent Verdict */}
      {stage >= 2 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="font-bold text-purple-700 text-[10px] uppercase">AI Decision Orchestrator</span>
          </div>
          <div className="text-slate-700 leading-relaxed text-[11px]">
            <TypewriterText 
              text={judgeText} 
              delay={10} 
              onComplete={() => setStage(3)}
            />
          </div>
        </div>
      )}

      {/* Human Officer Approval Panel */}
      {stage === 3 && awaitingApproval && (
        <div className="mt-auto border border-indigo-200 bg-indigo-50/50 rounded-lg p-4 text-center shadow-sm animate-pulse">
          <div className="text-[#4F46E5] font-bold text-xs uppercase tracking-widest mb-1.5">
            ⚠️ Safety Officer Action Required ⚠️
          </div>
          <p className="text-[11px] text-slate-600 mb-3 font-sans leading-relaxed">
            AI recommends <span className="text-slate-900 font-bold">Plan A</span> (Selective Permit Suspension + Extractor Ram). Autonomous action paused pending human authorization.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onApprove}
              className="px-5 py-1.5 rounded bg-safety-green text-white font-bold uppercase text-[10px] hover:bg-emerald-700 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              Approve Plan A
            </button>
            <button
              onClick={onEscalate}
              className="px-4 py-1.5 rounded border border-safety-yellow text-safety-yellow font-bold uppercase text-[10px] hover:bg-safety-yellow/10 transition-all active:scale-95 cursor-pointer"
            >
              Escalate to Supervisor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebatePanel;
