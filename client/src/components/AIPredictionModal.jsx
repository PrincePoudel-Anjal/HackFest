import React, { useState, useEffect } from "react";
import { Brain, Sparkles, X, ShieldAlert } from "lucide-react";

export default function AIPredictionModal({ isOpen, onClose, aiData, timelineCount }) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setAnalyzing(true);
      const timer = setTimeout(() => {
        setAnalyzing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold text-xl">
              <Brain className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Health Intelligence Engine</h3>
              <p className="text-xs text-slate-500">
                Longitudinal CDSS analysis over {timelineCount} connected medical records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {analyzing ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-900">Executing time-series longitudinal algorithms...</p>
            <p className="text-xs text-slate-500">Evaluating multi-year glycemic, cardiovascular, and renal trajectories</p>
          </div>
        ) : (
          <div className="space-y-5 animate-fadeIn">
            {/* Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Longitudinal Risk Tier</span>
                <div className="text-lg font-bold text-red-600 flex items-center space-x-1.5 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>High Pre-Diabetic Trajectory Risk</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Health Score</span>
                <div className="text-2xl font-black text-teal-700">{aiData.overallHealthScore} / 100</div>
              </div>
            </div>

            {/* Identified Trajectories */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase text-slate-500">Disease Risk Trajectories</h4>
              {aiData.riskScores.map((r, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{r.disease}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        r.severity === "High"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : r.severity === "Moderate"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {r.riskPercentage}% Risk ({r.severity})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{r.trend}</p>
                </div>
              ))}
            </div>

            {/* Clinical Explanation */}
            <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-xl text-xs text-slate-700 space-y-1">
              <span className="font-bold text-teal-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>Explainable AI Rationale:</span>
              </span>
              <p className="leading-relaxed text-slate-700">{aiData.explanation}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                Accept CDSS Insights & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
