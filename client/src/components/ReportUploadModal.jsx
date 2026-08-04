import React, { useState, useEffect } from "react";
import { X, FilePlus, Activity, Stethoscope, User, Hospital, AlertCircle, CheckCircle2, MapPin, Calendar, HeartPulse } from "lucide-react";

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

  // State for doctors loaded directly from GET /api/hospital/doctors (doctors array of logged-in hospital)
  const [doctorList, setDoctorList] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Form State matching exact required fields
  const [formData, setFormData] = useState({
    name: "Ram Kumar Sharma",
    age: "43",
    gender: "Male",
    address: "Ward 4, Balaju, Kathmandu, Bagmati Province",
    birthCertificateNumber: healthId || "BC-2080-94812",
    symptoms: "High fasting blood glucose (139 mg/dL), dry cough, headache & persistent fatigue",
    assignedDoctor: "",
    diagnosis: "Pre-Diabetic Glycemic Trajectory",
    notes: "Patient advised on 30-min daily exercise, glycemic tracking, and low-sodium diet.",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch doctors belonging to currently logged-in hospital on open via GET /api/hospital/doctors
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");

      let currentHospName = activeHospitalName;
      const saved = localStorage.getItem("hospital_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) {
            currentHospName = parsed.name;
            setActiveHospitalName(parsed.name);
          }
        } catch (e) {}
      }

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
            setFormData((prev) => ({
              ...prev,
              assignedDoctor: data.doctors[0], // Auto-select first doctor
            }));
          } else {
            const fallbackDocs = ["Dr. Ram Sharma", "Dr. Sita Karki", "Dr. Anil Gurung"];
            setDoctorList(fallbackDocs);
            setFormData((prev) => ({ ...prev, assignedDoctor: fallbackDocs[0] }));
          }
        } catch (err) {
          const fallbackDocs = ["Dr. Ram Sharma", "Dr. Sita Karki", "Dr. Anil Gurung"];
          setDoctorList(fallbackDocs);
          setFormData((prev) => ({ ...prev, assignedDoctor: fallbackDocs[0] }));
        } finally {
          setIsLoadingDoctors(false);
        }
      };

      fetchHospitalDoctors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Frontend validation
    if (!formData.name.trim()) {
      setErrorMsg("Full Name is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.age || isNaN(Number(formData.age))) {
      setErrorMsg("Valid Age is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.gender) {
      setErrorMsg("Gender is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address.trim()) {
      setErrorMsg("Address is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.birthCertificateNumber.trim()) {
      setErrorMsg("Birth Certificate Number is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.symptoms.trim()) {
      setErrorMsg("Symptoms are required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.assignedDoctor.trim()) {
      setErrorMsg("Please select an Assigned Doctor.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      address: formData.address.trim(),
      birthCertificateNumber: formData.birthCertificateNumber.trim(),
      symptoms: formData.symptoms.trim(),
      assignedDoctor: formData.assignedDoctor.trim(),
      diagnosis: formData.diagnosis ? formData.diagnosis.trim() : "",
      notes: formData.notes ? formData.notes.trim() : "",
    };

    try {
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Passes logged-in hospital cookie
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || "Patient record saved successfully to MongoDB!");
        
        // Pass record back to update timeline in UI
        const savedPatient = data.data;
        const newTimelineRecord = {
          id: savedPatient._id || "EV-" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          year: "2026",
          category: formData.diagnosis || "Clinical Diagnostic Assessment",
          hospital: activeHospitalName,
          doctor: formData.assignedDoctor,
          symptoms: formData.symptoms,
          patientName: formData.name,
          birthCertificateNumber: formData.birthCertificateNumber,
          metrics: {
            bloodSugar: 139,
            hba1c: 6.8,
            bp: "142/92",
            eGFR: 87,
          },
          notes: formData.notes,
        };

        onAddReport(newTimelineRecord);

        // Clear form after successful save
        setTimeout(() => {
          setFormData({
            name: "",
            age: "",
            gender: "Male",
            address: "",
            birthCertificateNumber: "",
            symptoms: "",
            assignedDoctor: doctorList[0] || "",
            diagnosis: "",
            notes: "",
          });
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to save patient record.");
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
        
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
              <FilePlus className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Assign Patient Record</h3>
              <p className="text-xs text-teal-700 font-semibold flex items-center space-x-1.5 mt-0.5">
                <Hospital className="w-3.5 h-3.5" />
                <span>Hospital Node: {activeHospitalName}</span>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECTION 1: Patient Details */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <User className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                1. Patient Demographics
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ram Kumar Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birth Certificate Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.birthCertificateNumber}
                  onChange={(e) => setFormData({ ...formData, birthCertificateNumber: e.target.value })}
                  placeholder="e.g. BC-2080-94812"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-teal-700 font-mono font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 43"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold shadow-sm"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Balaju, Kathmandu"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Doctor Dropdown (Read from Hospital Document) */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                2. Assigned Doctor (Read from {activeHospitalName} Document)
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Doctor <span className="text-red-500">*</span>
              </label>
              {isLoadingDoctors ? (
                <div className="text-xs text-slate-400 py-2.5 font-semibold animate-pulse">
                  ⏳ Fetching doctors from {activeHospitalName} document in database...
                </div>
              ) : (
                <select
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600 shadow-sm"
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
          </div>

          {/* SECTION 3: Symptoms */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                3. Clinical Symptoms <span className="text-red-500">*</span>
              </h4>
            </div>

            <textarea
              rows={2}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Enter patient symptoms e.g. High fever, dry cough, dizziness, elevated glucose..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-sm"
              required
            />
          </div>

          {/* SECTION 4: Diagnosis & Notes (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis (Optional)</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="e.g. Pre-Diabetic Trajectory"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Advised 30-min exercise daily"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all flex items-center space-x-2"
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
  );
}
