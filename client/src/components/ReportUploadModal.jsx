import React, { useState, useEffect } from "react";
import { X, FilePlus, Stethoscope, User, Hospital, AlertCircle, CheckCircle2, Search, Lock, HeartPulse, FileText } from "lucide-react";

export default function ReportUploadModal({ isOpen, onClose, onAddReport, healthId }) {
  // Read active hospital session
  const [activeHospitalName, setActiveHospitalName] = useState(() => {
    const saved = localStorage.getItem("hospital_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.name || "GMC EHR Portal";
      } catch (e) {}
    }
    return "GMC EHR Portal";
  });

  const [doctorList, setDoctorList] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Search & Lookup State
  const [certInput, setCertInput] = useState(healthId || "BC-2080-94812");
  const [isSearching, setIsSearching] = useState(false);
  const [foundCitizen, setFoundCitizen] = useState(null);
  const [searchError, setSearchError] = useState("");

  // Medical Record Form State
  const [symptoms, setSymptoms] = useState("High fasting blood glucose (139 mg/dL), persistent dry cough, headache & fatigue");
  const [diagnosis, setDiagnosis] = useState("Type 2 Diabetes Trajectory Assessment");
  const [prescription, setPrescription] = useState("Metformin 500mg daily, Low sodium diet, 30-min daily exercise");
  const [assignedDoctor, setAssignedDoctor] = useState("");
  const [visitDate, setVisitDate] = useState("2026-08-04");
  const [notes, setNotes] = useState("Patient advised on glycemic control & home BP tracking.");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch doctors belonging to currently logged-in hospital on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      setSearchError("");

      const fetchHospitalDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
          const response = await fetch("http://localhost:3000/api/hospital/doctors", {
            method: "GET",
            credentials: "include",
          });
          const data = await response.json();
          if (response.ok && data.doctors && data.doctors.length > 0) {
            setDoctorList(data.doctors);
            setAssignedDoctor(data.doctors[0]);
          } else {
            const fallbackDocs = ["Dr. Ram Sharma", "Dr. Sita Karki", "Dr. Binod Gurung"];
            setDoctorList(fallbackDocs);
            setAssignedDoctor(fallbackDocs[0]);
          }
        } catch (err) {
          const fallbackDocs = ["Dr. Ram Sharma", "Dr. Sita Karki", "Dr. Binod Gurung"];
          setDoctorList(fallbackDocs);
          setAssignedDoctor(fallbackDocs[0]);
        } finally {
          setIsLoadingDoctors(false);
        }
      };

      fetchHospitalDoctors();

      // Trigger automatic lookup if healthId passed
      if (healthId) {
        handleCitizenLookup(healthId);
      } else {
        handleCitizenLookup(certInput);
      }
    }
  }, [isOpen]);

  const handleCitizenLookup = async (searchCert = certInput) => {
    if (!searchCert || !searchCert.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setFoundCitizen(null);

    try {
      const response = await fetch(`http://localhost:3000/api/citizens/lookup?birthCertificateNumber=${searchCert.trim()}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.found && data.citizen) {
        setFoundCitizen(data.citizen);
      } else {
        setSearchError("Citizen not found. Please register the newborn first.");
      }
    } catch (err) {
      setSearchError("Citizen not found. Please register the newborn first.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundCitizen) {
      setErrorMsg("Cannot create medical record. Citizen not found. Please register the newborn first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!symptoms.trim()) {
      setErrorMsg("Symptoms are required.");
      setIsSubmitting(false);
      return;
    }

    if (!assignedDoctor.trim()) {
      setErrorMsg("Please select an Assigned Doctor.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      birthCertificateNumber: foundCitizen.birthCertificateNumber,
      symptoms: symptoms.trim(),
      diagnosis: diagnosis ? diagnosis.trim() : "Clinical Diagnostic Assessment",
      prescription: prescription ? prescription.trim() : "Metformin 500mg daily",
      assignedDoctor: assignedDoctor.trim(),
      visitDate: visitDate,
      notes: notes ? notes.trim() : "",
    };

    try {
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || `Medical record for '${foundCitizen.fullName}' saved successfully!`);
        if (onAddReport) onAddReport(data.patient);

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to save medical record.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to backend database server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-7 shadow-2xl space-y-6 animate-fadeIn max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
              <FilePlus className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Patient Medical Record</h3>
              <p className="text-xs text-teal-700 font-semibold flex items-center space-x-1.5 mt-0.5">
                <Hospital className="w-3.5 h-3.5" />
                <span>Node: {activeHospitalName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-5">
          
          {/* STEP 1: PATIENT BIRTH CERTIFICATE SEARCH */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              1. Search Citizen by Birth Certificate Number
            </label>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCitizenLookup(certInput);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="Enter Birth Certificate Number (e.g. BC-2080-94812)..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-teal-800 font-mono font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                {isSearching ? "Searching..." : "Lookup Citizen"}
              </button>
            </form>

            {searchError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* STEP 2: READ-ONLY PATIENT PROFILE (IF FOUND) */}
          {foundCitizen ? (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4.5 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                    Verified Citizen Profile (Read-Only)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Auto-filled from Database</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Full Name</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{foundCitizen.fullName || foundCitizen.name}</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Health ID</span>
                  <p className="text-xs font-mono font-bold text-teal-700 mt-0.5">{foundCitizen.healthId}</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Age / Gender</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {foundCitizen.age} yrs • {foundCitizen.gender}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</span>
                  <p className="text-xs font-bold text-red-600 mt-0.5">{foundCitizen.bloodGroup || "O+"}</p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Address</span>
                <span className="font-semibold text-slate-800">{foundCitizen.address}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 italic">
              Please enter a valid Birth Certificate Number above to load citizen details.
            </div>
          )}

          {/* STEP 3: MEDICAL DETAILS FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  2. Clinical Visit Medical Details
                </h4>
              </div>

              {/* Assigned Doctor Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Doctor ({activeHospitalName}) <span className="text-red-500">*</span>
                  </label>
                  {isLoadingDoctors ? (
                    <div className="text-xs text-slate-400 py-2">Loading doctors...</div>
                  ) : (
                    <select
                      value={assignedDoctor}
                      onChange={(e) => setAssignedDoctor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                      disabled={!foundCitizen}
                      required
                    >
                      {doctorList.map((docName, idx) => (
                        <option key={idx} value={docName}>
                          👨‍⚕️ {docName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold"
                    disabled={!foundCitizen}
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Symptoms & Patient Complaints <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms e.g. High fasting blood glucose, dry cough, fatigue..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-sm"
                  disabled={!foundCitizen}
                  required
                />
              </div>

              {/* Diagnosis & Prescription */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes Trajectory"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    disabled={!foundCitizen}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rx Prescription</label>
                  <input
                    type="text"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="e.g. Metformin 500mg daily"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    disabled={!foundCitizen}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  disabled={!foundCitizen}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !foundCitizen}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center space-x-2 ${
                  foundCitizen
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span>Saving to MongoDB...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Patient Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
