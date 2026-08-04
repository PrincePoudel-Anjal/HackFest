import React, { useState, useEffect } from "react";
import ReportUploadModal from "./ReportUploadModal";
import Timeline from "./Timeline";
import { Search, PlusCircle, Hospital, UserCheck, ShieldCheck, Stethoscope, LogOut, Edit2, Trash2, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function HospitalPortal({ healthId, setHealthId }) {
  // Hospital Login State
  const [activeHospital, setActiveHospital] = useState(() => {
    const saved = localStorage.getItem("hospital_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Hospital Dashboard & Patient Data
  const [patients, setPatients] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (activeHospital) {
      fetchHospitalPatients();
      fetchHospitalDoctors();
    }
  }, [activeHospital]);

  const fetchHospitalPatients = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/patients", { credentials: "include" });
      const data = await response.json();
      if (response.ok && data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {}
  };

  const fetchHospitalDoctors = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/hospital/doctors", { credentials: "include" });
      const data = await response.json();
      if (response.ok && data.doctors) {
        setDoctorList(data.doctors);
      }
    } catch (err) {}
  };

  const handleHospitalLogin = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setLoginError("");

    try {
      const response = await fetch("http://localhost:3000/api/hospital/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setActiveHospital(data.hospital);
        localStorage.setItem("hospital_session", JSON.stringify(data.hospital));
        showToast(`Welcome to ${data.hospital.hospitalName || data.hospital.name}!`);
      } else {
        setLoginError(data.message || "Invalid Hospital Username or Password.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handle1ClickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    handleHospitalLogin({ preventDefault: () => {} });
  };

  const handleHospitalLogout = () => {
    localStorage.removeItem("hospital_session");
    setActiveHospital(null);
    setPatients([]);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeletePatient = async (id, patientName) => {
    if (!window.confirm(`Are you sure you want to delete patient record for '${patientName}'?`)) return;

    try {
      const response = await fetch(`http://localhost:3000/api/patients/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`Patient record for '${patientName}' deleted successfully.`);
        fetchHospitalPatients();
      } else {
        alert(data.message || "Failed to delete patient record.");
      }
    } catch (err) {
      alert("Error deleting patient record.");
    }
  };

  // Filtered Patients List for Tenant Isolation View
  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.birthCertificateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.assignedDoctor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UNAUTHENTICATED: HOSPITAL LOGIN SHIELD
  if (!activeHospital) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
            <Hospital className="w-8 h-8 text-teal-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Hospital Portal Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">
              Log in using username and password created by System Admin
            </p>
          </div>

          <form onSubmit={handleHospitalLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. pokhara_admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isLoadingAuth ? <span>Authenticating Hospital...</span> : <span>Log In to Hospital Node</span>}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 space-y-1.5 text-left">
            <span className="text-[11px] text-slate-400 block font-semibold">Quick Demo Hospital Credentials:</span>
            <div className="space-y-1">
              <button
                onClick={() => handle1ClickLogin("pokhara_admin", "pokhara123")}
                className="w-full text-left text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold flex items-center justify-between"
              >
                <span>🏥 Pokhara Regional Hospital</span>
                <span className="font-mono text-[10px]">pokhara_admin / pokhara123</span>
              </button>
              <button
                onClick={() => handle1ClickLogin("tuth_admin", "tuth123")}
                className="w-full text-left text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold flex items-center justify-between"
              >
                <span>🏥 TUTH Hospital</span>
                <span className="font-mono text-[10px]">tuth_admin / tuth123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: HOSPITAL WORKSPACE
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200 flex items-center space-x-1">
              <Hospital className="w-3.5 h-3.5 text-teal-600" />
              <span>Node: {activeHospital.hospitalName || activeHospital.name}</span>
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              User ID: {activeHospital.username}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            {activeHospital.hospitalName || activeHospital.name} Dashboard
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hospital Doctors ({doctorList.length}):</span>
            </span>
            {doctorList.map((doc, idx) => (
              <span key={idx} className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-bold">
                👨‍⚕️ {doc}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assign Patient Record</span>
          </button>
          <button
            onClick={handleHospitalLogout}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
            title="Logout Hospital Session"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Patients</span>
          <p className="text-3xl font-black text-slate-900 font-mono">{patients.length}</p>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Tenant Isolated Records
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Doctors</span>
          <p className="text-3xl font-black text-slate-900 font-mono">{doctorList.length}</p>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Hospital Practitioner Roster
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Recent Visits</span>
          <p className="text-3xl font-black text-slate-900 font-mono">{patients.length}</p>
          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Saved to MongoDB
          </span>
        </div>
      </div>

      {/* PATIENT RECORDS TABLE WITH SEARCH & FILTER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Hospital Patient Records ({filteredPatients.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Filtered exclusively for {activeHospital.hospitalName || activeHospital.name}</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name or Birth Cert No..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Birth Certificate No.</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4">Symptoms & Diagnosis</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.map((pat) => (
                <tr key={pat._id || pat.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{pat.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold text-[11px]">
                      {pat.birthCertificateNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {pat.age} yrs • <strong className="text-slate-900">{pat.gender}</strong>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">
                    👨‍⚕️ {pat.assignedDoctor}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">{pat.diagnosis}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{pat.symptoms}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleDeletePatient(pat._id || pat.id, pat.name)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-all"
                      title="Delete Patient Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN PATIENT RECORD MODAL */}
      <ReportUploadModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAddReport={(newPat) => {
          fetchHospitalPatients();
          showToast("Patient record saved successfully!");
        }}
        healthId={healthId}
      />
    </div>
  );
}
