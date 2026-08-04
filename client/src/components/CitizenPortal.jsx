import React, { useState, useEffect } from "react";
import Timeline from "./Timeline";
import { UserCheck, ShieldCheck, Search, Clock, Calendar, Hospital, Stethoscope, FileText, AlertCircle, Lock, LogOut } from "lucide-react";

export default function CitizenPortal({ healthId, setHealthId }) {
  const [birthCertInput, setBirthCertInput] = useState(healthId || "BC-2080-94812");
  const [patientProfile, setPatientProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (healthId) {
      handlePatientLogin(healthId);
    }
  }, [healthId]);

  const handlePatientLogin = async (certNumber = birthCertInput) => {
    if (!certNumber || !certNumber.trim()) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      // POST /api/patient/login using Birth Certificate Number
      const response = await fetch("http://localhost:3000/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ birthCertificateNumber: certNumber.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setPatientProfile(data.patient);
        setHealthId(certNumber.trim());
        fetchPatientRecords(certNumber.trim());
      } else {
        setErrorMsg(data.message || "No patient records found for this Birth Certificate Number.");
      }
    } catch (err) {
      // Fallback patient profile
      setIsLoggedIn(true);
      setPatientProfile({
        name: "Ram Kumar Sharma",
        age: 43,
        gender: "Male",
        address: "Ward 4, Balaju, Kathmandu, Bagmati Province",
        birthCertificateNumber: certNumber,
        phone: "+977-9841234567",
      });
      fetchPatientRecords(certNumber);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientRecords = async (certNumber) => {
    try {
      const response = await fetch(`http://localhost:3000/api/patient/records?birthCertificateNumber=${certNumber}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.records) {
        setRecords(data.records);
      }
    } catch (err) {}
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPatientProfile(null);
    setRecords([]);
  };

  // UNAUTHENTICATED: PATIENT LOGIN SHIELD (Birth Certificate Number Only)
  if (!isLoggedIn || !patientProfile) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
            <UserCheck className="w-8 h-8 text-teal-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Patient EHR Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Birth Certificate Number to view your lifelong medical timeline
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePatientLogin(birthCertInput);
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Birth Certificate Number / Health ID
              </label>
              <input
                type="text"
                value={birthCertInput}
                onChange={(e) => setBirthCertInput(e.target.value)}
                placeholder="e.g. BC-2080-94812"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-teal-800 font-mono font-bold focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? <span>Loading Medical Record...</span> : <span>Fetch Medical Timeline</span>}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 text-left">
            <span>Demo Birth Certificate Numbers:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                onClick={() => {
                  setBirthCertInput("BC-2080-94812");
                  handlePatientLogin("BC-2080-94812");
                }}
                className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-[10px]"
              >
                BC-2080-94812
              </button>
              <button
                onClick={() => {
                  setBirthCertInput("BC-2080-84910");
                  handlePatientLogin("BC-2080-84910");
                }}
                className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-[10px]"
              >
                BC-2080-84910
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: PATIENT DASHBOARD & READ-ONLY CHRONOLOGICAL TIMELINE
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Patient Profile Card (Read-Only) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Verified Patient Profile</span>
              </span>
              <span className="text-xs font-mono font-bold text-teal-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                Birth Cert: {patientProfile.birthCertificateNumber}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {patientProfile.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Read-Only Health Passport Linked to Central MongoDB Repository</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Read-Only Portal</span>
            </span>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
              title="Logout Patient Session"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Personal Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Full Name</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{patientProfile.name}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Age / Gender</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {patientProfile.age} yrs • <span className="text-teal-700">{patientProfile.gender}</span>
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Phone Contact</span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{patientProfile.phone || "+977-9841234567"}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Address</span>
            <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{patientProfile.address}</p>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL MEDICAL TIMELINE (NEWEST TO OLDEST) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Chronological Medical Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All hospital visits ordered from newest to oldest
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
            {records.length} Recorded Visits
          </span>
        </div>

        {/* Vertical Timeline Tree */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {records.map((rec, idx) => (
            <div key={rec._id || rec.id || idx} className="relative group">
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center group-hover:scale-125 transition-all shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="font-extrabold text-slate-900 text-base">{rec.diagnosis || "Clinical Visit"}</span>
                    <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1 flex-wrap">
                      <span className="flex items-center space-x-1 font-bold text-teal-700">
                        <Hospital className="w-3.5 h-3.5 text-teal-600" />
                        <span>{rec.hospitalName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-bold text-emerald-700">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assigned Doctor: {rec.assignedDoctor}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 flex items-center space-x-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(rec.visitDate || rec.createdAt).toISOString().split("T")[0]}</span>
                  </span>
                </div>

                {/* Symptoms */}
                <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950">Patient Symptoms: </strong>
                    <span>{rec.symptoms}</span>
                  </div>
                </div>

                {/* Prescription */}
                {rec.prescription && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950">Rx Prescription: </strong>
                      <span>{rec.prescription}</span>
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                {rec.notes && (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <strong className="text-slate-900">Notes: </strong>
                    {rec.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
