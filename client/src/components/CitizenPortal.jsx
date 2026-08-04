import React from "react";
import HealthScoreCard from "./HealthScoreCard";
import Timeline from "./Timeline";
import { ShieldCheck, MapPin, Phone } from "lucide-react";

export default function CitizenPortal({ citizen, timeline, aiData }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Demographics Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-500 p-0.5 shadow-md shadow-teal-500/20">
            <div className="w-full h-full bg-slate-50 rounded-[14px] flex items-center justify-center font-black text-teal-700 text-2xl">
              {citizen.fullName.split(" ")[0][0]}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{citizen.fullName}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono font-bold border border-teal-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{citizen.healthId}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3 flex-wrap">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{citizen.address}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{citizen.phone}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Vital stats pill container */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Age / Gender</span>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {citizen.age} yrs • {citizen.gender}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Group</span>
            <div className="text-xs font-bold text-red-600 mt-0.5">{citizen.bloodGroup}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Emergency Contact</span>
            <div className="text-xs font-bold text-teal-700 mt-0.5">
              {citizen.emergencyContact.name.split(" ")[0]}
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Radar Score Card */}
      <HealthScoreCard aiData={aiData} />

      {/* Lifelong Medical Timeline */}
      <Timeline timeline={timeline} />
    </div>
  );
}
