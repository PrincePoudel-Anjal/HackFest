import React, { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, Clock, Calendar, Hospital, Stethoscope, FileText, AlertCircle, Lock, LogOut, Loader2 } from "lucide-react";

export default function CitizenPortal({ healthId, setHealthId }) {
  const [birthCertInput, setBirthCertInput] = useState(healthId || "BC-1111-1111");
  const [patientProfile, setPatientProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    // Auto-login if patient token or healthId exists in localStorage
    const savedToken = localStorage.getItem("patientToken");
    const savedCert = localStorage.getItem("patientCert") || healthId;
    if (savedToken && savedCert) {
      handlePatientLogin(savedCert, savedToken);
    } else if (healthId) {
      handlePatientLogin(healthId);
    }
  }, [healthId]);

  const safeSetHealthId = (val) => {
    if (typeof setHealthId === "function") {
      setHealthId(val);
    }
  };

  const handlePatientLogin = async (certNumber = birthCertInput, existingToken = null) => {
    if (!certNumber || !certNumber.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    setApiError("");

    const cleanCert = certNumber.trim();

    try {
      let token = existingToken || localStorage.getItem("patientToken");
      let data = null;

      if (!existingToken) {
        const response = await fetch("http://localhost:3000/api/patient/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ birthCertificateNumber: cleanCert }),
        });

        data = await response.json();

        if (!response.ok || !data.success) {
          setErrorMsg(data.message || `No registered citizen or medical records found for Birth Certificate '${cleanCert}'.`);
          setIsLoading(false);
          return;
        }

        token = data.token;
        if (token) {
          localStorage.setItem("patientToken", token);
          localStorage.setItem("patientCert", cleanCert);
        }
      }

      setIsLoggedIn(true);

      if (data?.patient) {
        setPatientProfile(data.patient);
      } else {
        await fetchPatientProfile(cleanCert, token);
      }

      safeSetHealthId(cleanCert);
      fetchPatientRecords(cleanCert, token);
    } catch (err) {
      console.error("[PATIENT LOGIN ERROR]", err);
      setApiError("Failed to connect to authentication backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientProfile = async (cleanCert, token) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3000/api/patient/profile?birthCertificateNumber=${cleanCert}`, {
        headers,
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.patient) {
        setPatientProfile(data.patient);
      } else {
        setApiError(data.message || "Failed to fetch patient profile from database.");
      }
    } catch (err) {
      setApiError("Error connecting to server to fetch profile.");
    }
  };

  const fetchPatientRecords = async (certNumber, token) => {
    setIsLoadingRecords(true);
    setApiError("");
    try {
      const headers = { "Content-Type": "application/json" };
      const activeToken = token || localStorage.getItem("patientToken");
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const response = await fetch(`http://localhost:3000/api/patient/records?birthCertificateNumber=${certNumber}`, {
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.records)) {
        setRecords(data.records);
      } else {
        setApiError(data.message || "Failed to load patient medical records from server.");
      }
    } catch (err) {
      console.error("[FETCH RECORDS ERROR]", err);
      setApiError("Network error while loading medical history from database server.");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientCert");
    setIsLoggedIn(false);
    setPatientProfile(null);
    setRecords([]);
  };

  // UNAUTHENTICATED: PATIENT LOGIN SHIELD
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
                placeholder="e.g. BC-1111-1111 or BC-2080-94812"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-teal-800 font-mono font-bold focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Loading Medical Record...</span>
                </>
              ) : (
                <span>Fetch Medical Timeline</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 text-left">
            <span>Demo Registered Birth Certificate Numbers:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                onClick={() => {
                  setBirthCertInput("BC-1111-1111");
                  handlePatientLogin("BC-1111-1111");
                }}
                className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-[10px]"
              >
                Samir Bhandari (BC-1111-1111)
              </button>
              <button
                onClick={() => {
                  setBirthCertInput("BC-2080-94812");
                  handlePatientLogin("BC-2080-94812");
                }}
                className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-[10px]"
              >
                Ram Kumar (BC-2080-94812)
              </button>
              <button
                onClick={() => {
                  setBirthCertInput("BC-2080-84910");
                  handlePatientLogin("BC-2080-84910");
                }}
                className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-[10px]"
              >
                Sita Kumari (BC-2080-84910)
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
      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>API Error: {apiError}</span>
        </div>
      )}

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
              {patientProfile.name || patientProfile.fullName}
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
            <p className="text-sm font-bold text-slate-900 mt-0.5">{patientProfile.name || patientProfile.fullName}</p>
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

        {/* Loading Spinner / Timeline Content */}
        {isLoadingRecords ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Fetching lifelong medical records from central repository...</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {records.length > 0 ? (
              records.map((rec, idx) => (
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
                            <span>{rec.hospitalName || "Regional Hospital"}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1 font-bold text-emerald-700">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Assigned Doctor: {rec.assignedDoctor || "Attending Physician"}</span>
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
                        <span>{rec.symptoms || "Clinical symptoms recorded."}</span>
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
              ))
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 italic">
                No medical records found for this patient yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
