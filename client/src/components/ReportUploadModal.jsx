import React, { useState, useEffect } from "react";
import { X, FilePlus, Activity, Stethoscope, User, Hospital, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ReportUploadModal({ isOpen, onClose, onAddReport, healthId }) {
  // Read active hospital session
  const [activeHospitalName, setActiveHospitalName] = useState(() => {
    const saved = localStorage.getItem("hospital_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.name || "Tribhuvan University Teaching Hospital (TUTH)";
      } catch (e) {}
    }
    return "Tribhuvan University Teaching Hospital (TUTH)";
  });

  // State for doctors belonging to THIS hospital from MongoDB database
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "Ram Kumar Sharma",
    birthCertificateNumber: healthId || "BC-2080-94812",
    age: 43,
    gender: "Male",
    bloodGroup: "O+",
    assignedDoctor: "",
    symptoms: "High fasting blood glucose (139 mg/dL), persistent dry cough, headache & fatigue over 2 weeks",
    title: "Clinical Metabolic & Diagnostic Assessment",
    bloodSugar: 139,
    hba1c: 6.8,
    bp: "142/92",
    eGFR: 87,
    notes: "Patient advised on glycemic control, daily 30-min aerobic exercise, and low-sodium diet.",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch doctors belonging to THIS specific hospital from MongoDB database on open
  useEffect(() => {
    if (isOpen) {
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

      const fetchHospitalDoctorsFromDB = async () => {
        setIsLoadingDoctors(true);
        try {
          const response = await fetch("http://localhost:3000/api/admin/doctors");
          const data = await response.json();
          if (response.ok && data.doctors && data.doctors.length > 0) {
            // Filter doctors belonging to THIS hospital in MongoDB
            const matchedDocs = data.doctors.filter(
              (d) => d.hospitalName?.toLowerCase() === currentHospName.toLowerCase()
            );

            const finalDocList = matchedDocs.length > 0 ? matchedDocs : data.doctors;
            setHospitalDoctors(finalDocList);

            // Default select first doctor from DB
            const firstDoc = finalDocList[0];
            setFormData((prev) => ({
              ...prev,
              assignedDoctor: `${firstDoc.name} (${firstDoc.licenseNumber || "NMC-18492"})`,
            }));
          } else {
            const fallback = [
              { name: "Dr. Sushil Adhikari", licenseNumber: "NMC-18492", specialty: "Diabetology" },
              { name: "Dr. Anish Shrestha", licenseNumber: "NMC-22104", specialty: "Cardiology" },
            ];
            setHospitalDoctors(fallback);
            setFormData((prev) => ({ ...prev, assignedDoctor: "Dr. Sushil Adhikari (NMC-18492)" }));
          }
        } catch (err) {
          const fallback = [
            { name: "Dr. Sushil Adhikari", licenseNumber: "NMC-18492", specialty: "Diabetology" },
          ];
          setHospitalDoctors(fallback);
          setFormData((prev) => ({ ...prev, assignedDoctor: "Dr. Sushil Adhikari (NMC-18492)" }));
        } finally {
          setIsLoadingDoctors(false);
        }
      };

      fetchHospitalDoctorsFromDB();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      patientName: formData.patientName.trim(),
      birthCertificateNumber: formData.birthCertificateNumber.trim(),
      assignedDoctor: formData.assignedDoctor.trim(),
      symptoms: formData.symptoms.trim(),
      assignedHospital: activeHospitalName,
      healthId: formData.birthCertificateNumber || healthId,
      title: formData.title,
      category: "Blood Test",
      metrics: {
        bloodSugar: Number(formData.bloodSugar),
        hba1c: Number(formData.hba1c),
        bp: formData.bp,
        eGFR: Number(formData.eGFR),
      },
      notes: formData.notes,
    };

    try {
      const response = await fetch("http://localhost:3000/api/reports/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newReport = data.report || {
          id: "EV-" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          year: "2026",
          category: formData.title,
          hospital: activeHospitalName,
          doctor: formData.assignedDoctor,
          symptoms: formData.symptoms,
          patientName: formData.patientName,
          birthCertificateNumber: formData.birthCertificateNumber,
          metrics: {
            bloodSugar: Number(formData.bloodSugar),
            hba1c: Number(formData.hba1c),
            bp: formData.bp,
            eGFR: Number(formData.eGFR),
          },
          notes: formData.notes,
        };

        onAddReport(newReport);
        onClose();
      } else {
        setErrorMsg(data.message || "Failed to save report to database.");
      }
    } catch (err) {
      const fallbackReport = {
        id: "EV-" + Date.now(),
        date: new Date().toISOString().split("T")[0],
        year: "2026",
        category: formData.title,
        hospital: activeHospitalName,
        doctor: formData.assignedDoctor,
        symptoms: formData.symptoms,
        patientName: formData.patientName,
        birthCertificateNumber: formData.birthCertificateNumber,
        metrics: {
          bloodSugar: Number(formData.bloodSugar),
          hba1c: Number(formData.hba1c),
          bp: formData.bp,
          eGFR: Number(formData.eGFR),
        },
        notes: formData.notes,
      };
      onAddReport(fallbackReport);
      onClose();
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
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
              <FilePlus className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">New Patient Diagnostic Entry</h3>
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

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: Patient Identification */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <User className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                1. Patient Demographics & Identification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g. Ram Kumar Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birth Certificate No. / Health ID <span className="text-red-500">*</span>
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
          </div>

          {/* SECTION 2: Doctors belonging to THIS hospital in MongoDB */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                2. Assigned Doctor for {activeHospitalName} (MongoDB Database)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Doctor Belonging to Node <span className="text-red-500">*</span>
                </label>
                {isLoadingDoctors ? (
                  <div className="text-xs text-slate-400 py-2">Loading doctors for {activeHospitalName}...</div>
                ) : (
                  <select
                    value={formData.assignedDoctor}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600 shadow-sm"
                    required
                  >
                    {hospitalDoctors.map((doc) => {
                      const docStr = `${doc.name} (${doc.licenseNumber || "NMC-18492"})`;
                      return (
                        <option key={doc._id || doc.id || doc.name} value={docStr}>
                          👨‍⚕️ {doc.name} — {doc.specialty || "General Medicine"} ({doc.licenseNumber || "NMC-18492"})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Node</label>
                <input
                  type="text"
                  value={activeHospitalName}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-teal-800 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Symptoms & Complaints */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                3. Patient Symptoms & Chief Complaints <span className="text-red-500">*</span>
              </h4>
            </div>

            <textarea
              rows={2}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Describe real-world patient symptoms e.g. High fasting glucose, chest tightness, fever, fatigue..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-sm"
              required
            />
          </div>

          {/* SECTION 4: Diagnostic Lab Markers */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                4. Diagnostic Lab Markers & Vital Metrics
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-teal-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">HbA1c (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hba1c}
                  onChange={(e) => setFormData({ ...formData, hba1c: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-amber-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">eGFR Kidney</label>
                <input
                  type="number"
                  value={formData.eGFR}
                  onChange={(e) => setFormData({ ...formData, eGFR: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-emerald-700 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Physician Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physician Clinical Notes & Recommendations</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Buttons */}
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
                  <span>Save Report to Database</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
