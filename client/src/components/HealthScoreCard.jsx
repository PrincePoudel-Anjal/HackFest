import React from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Activity, Sparkles } from "lucide-react";

export default function HealthScoreCard({ aiData }) {
  const getBadgeStyle = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Card Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Health Intelligence Radar</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                CDSS Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Time-series longitudinal analysis of {aiData.analyzedRecordsCount} lifetime health events
            </p>
          </div>
        </div>

        {/* Overall Health Score Card */}
        <div className="flex items-center space-x-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Composite Health Index</span>
            <div className="text-2xl font-black text-teal-700 tracking-tight">
              {aiData.overallHealthScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-teal-600 flex items-center justify-center text-xs font-bold text-teal-700 bg-white shadow-sm">
            78%
          </div>
        </div>
      </div>

      {/* Disease Risk Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Longitudinal Risk Forecast</span>
          </h3>
          <span className="text-[11px] text-slate-400">Updated: {aiData.analyzedDate}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aiData.riskScores.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                  {item.disease}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${getBadgeStyle(
                    item.severity
                  )}`}
                >
                  {item.severity} Risk
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Risk Score</span>
                  <span className="font-mono font-bold text-slate-900">{item.riskPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.severity === "High"
                        ? "bg-red-500"
                        : item.severity === "Moderate"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${item.riskPercentage}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 flex items-start space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <span>{item.trend}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Rationale */}
      <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200/80 space-y-1.5">
        <h4 className="text-xs font-bold uppercase text-teal-800 tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Explainable AI Clinical Rationale</span>
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed pl-5 border-l-2 border-teal-500">
          {aiData.explanation}
        </p>
      </div>

      {/* Action Plan & Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase text-amber-700 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Suggested Diagnostic Follow-up</span>
          </h4>
          <ul className="space-y-1.5">
            {aiData.recommendedTests.map((test, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-center space-x-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{test}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase text-emerald-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preventive Interventions</span>
          </h4>
          <ul className="space-y-1.5">
            {aiData.lifestyleSuggestions.map((item, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-center space-x-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
