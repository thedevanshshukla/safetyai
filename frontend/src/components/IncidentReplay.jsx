import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

const IncidentReplay = ({ isReplayMode, setIsReplayMode, replayIndex, setReplayIndex, replayData }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && isReplayMode && replayData.length > 0) {
      interval = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= replayData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500); // 500ms per step during play
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isReplayMode, replayData]);

  if (replayData.length === 0) return null;

  const currentReplayPoint = replayData[replayIndex] || {};

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center h-full select-none font-sans text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-850">
            Incident Flight Recorder (Replay Mode)
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Historical telemetry scrub timeline</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const nextMode = !isReplayMode;
              setIsReplayMode(nextMode);
              setIsPlaying(false);
              if (nextMode) {
                setReplayIndex(0);
              }
            }}
            className={`px-3 py-1 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer font-sans ${
              isReplayMode 
                ? "bg-[#E11D48] text-white shadow-sm hover:bg-[#BE123C] animate-pulse" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
          >
            {isReplayMode ? "EXIT REPLAY" : "ENTER REPLAY"}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
        {/* Controls block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (!isReplayMode) setIsReplayMode(true);
                setIsPlaying(!isPlaying);
              }}
              disabled={replayData.length === 0}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 active:scale-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
            </button>
            <button
              onClick={() => {
                setReplayIndex(0);
                setIsPlaying(false);
              }}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#4F46E5] hover:border-indigo-300 active:scale-90 transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Current scrubber status */}
          <div className="text-right text-[10px]">
            <div className="font-bold text-slate-500 font-sans">
              TIME: <span className="text-slate-805 font-bold font-mono">{currentReplayPoint.time || "09:00:00"}</span>
            </div>
            <div className="text-slate-500 text-[9px] mt-0.5 uppercase font-sans">
              TICK: <span className="font-mono">{replayIndex}</span> / <span className="font-mono">{replayData.length - 1}</span> | RISK: <span className={`font-mono font-bold ${
                currentReplayPoint.risk_level === "ACT" || currentReplayPoint.risk_level === "EMERGENCY" ? "text-red-600" : "text-[#4F46E5]"
              }`}>{currentReplayPoint.risk_level}</span>
            </div>
          </div>
        </div>

        {/* Scrubber slider */}
        <div className="flex items-center space-x-3 w-full">
          <input
            type="range"
            min="0"
            max={replayData.length - 1}
            value={replayIndex}
            onChange={(e) => {
              if (!isReplayMode) setIsReplayMode(true);
              setIsPlaying(false);
              setReplayIndex(parseInt(e.target.value));
            }}
            className="flex-grow h-1.5 rounded-full bg-slate-200 appearance-none cursor-pointer border border-slate-300 outline-none accent-[#4F46E5]"
          />
        </div>

        {/* Informative indicator */}
        <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-sans">
          <AlertTriangle size={10} className="text-[#4F46E5] animate-pulse" />
          <span>
            {isReplayMode 
              ? "Replay Mode overrides live telemetry. Scrubber active." 
              : "Scrubbing is inactive. Displaying live system feed."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncidentReplay;
