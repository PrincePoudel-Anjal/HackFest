import React from "react";
import { Hospital, Stethoscope, Calendar, FileText, Clock, User, AlertCircle } from "lucide-react";

export default function Timeline({ timeline }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Lifelong Medical Record Timeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous medical record stream linked to National Health ID & Birth Certificate
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
          {timeline.length} MongoDB Records
        </span>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => {
          const patientName = event.patientName || "Ram Kumar Sharma";
          const birthCertNo = event.birthCertificateNumber || event.healthId || "BC-2080-94812";
          const assignedDoc = event.assignedDoctor || event.doctor || "Dr. Sushil Adhikari";
          const assignedHosp = event.assignedHospital || event.hospital || "Tribhuvan University Teaching Hospital (TUTH)";
          const symptomsText = event.symptoms || "Patient presented with fatigue & elevated glycemic parameters.";

          return (
            <div key={event.id || event._id || idx} className="relative group">
              {/* Node Bullet */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center group-hover:scale-125 transition-all shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
              </div>

              {/* Event Card */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:bg-slate-50 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-slate-900 text-base">{event.category || event.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono font-bold border border-teal-200 flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{patientName}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
                        Birth Cert: {birthCertNo}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1.5 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1 font-semibold text-teal-700">
                        <Hospital className="w-3.5 h-3.5 text-teal-600" />
                        <span>{assignedHosp}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-semibold text-emerald-700">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assigned Doctor: {assignedDoc}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 flex items-center space-x-1 shadow-sm shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.date || event.recordDate?.split("T")[0] || "2026-08-04"}</span>
                  </span>
                </div>

                {/* Patient Symptoms Box */}
                <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950">Patient Symptoms & Complaints: </strong>
                    <span>{symptomsText}</span>
                  </div>
                </div>

                {/* Lab Metrics Grid */}
                {event.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Fasting Glucose</span>
                      <div className="text-sm font-mono font-bold text-teal-700">
                        {event.metrics.bloodSugar || 137} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">HbA1c Level</span>
                      <div className="text-sm font-mono font-bold text-amber-700">
                        {event.metrics.hba1c || 6.7}%
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Pressure</span>
                      <div className="text-sm font-mono font-bold text-slate-900">
                        {event.metrics.bp || `${event.metrics.bloodPressureSystolic || 140}/${event.metrics.bloodPressureDiastolic || 90}`}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">eGFR Kidney</span>
                      <div className="text-sm font-mono font-bold text-emerald-700">
                        {event.metrics.eGFR || 88} <span className="text-[10px] font-normal text-slate-400">mL/min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                {event.notes && (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Clinical Evaluation: </strong>
                      {event.notes}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
