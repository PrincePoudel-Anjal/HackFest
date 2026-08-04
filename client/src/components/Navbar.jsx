import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, UserCheck, Hospital, ShieldAlert, Sparkles } from "lucide-react";

export default function Navbar({ activePortal, setActivePortal, healthId }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Header -> Navigates to Landing Page '/' */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate("/")}
          title="Return to LifeTrack Nepal Landing Page"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-500 p-0.5 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-teal-600 text-lg">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                LifeTrack Nepal
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>EHR MVP Platform</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              National Health Intelligence & Healthcare Record System
            </p>
          </div>
        </div>

        {/* Health ID Chip */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span className="text-[11px] text-slate-500 uppercase font-semibold">National Health ID:</span>
          <span className="text-xs font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            {healthId || "BC-2080-94812"}
          </span>
        </div>

        {/* 3 Portal Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1">
          <button
            onClick={() => {
              if (setActivePortal) setActivePortal("citizen");
              navigate("/patient");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePortal === "citizen"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>

          <button
            onClick={() => {
              if (setActivePortal) setActivePortal("hospital");
              navigate("/hospital");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePortal === "hospital"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Hospital Portal</span>
          </button>

          <button
            onClick={() => {
              if (setActivePortal) setActivePortal("admin");
              navigate("/admin");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePortal === "admin"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
