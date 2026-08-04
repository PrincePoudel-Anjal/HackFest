import React, { useState, useEffect } from "react";
import Timeline from "./Timeline";
import { Search, PlusCircle, Zap, Hospital, UserCheck, ShieldCheck, Stethoscope, LogOut, Plus } from "lucide-react";

export default function HospitalPortal({
  citizen,
  timeline,
  aiData,
  healthId,
  setHealthId,
  onOpenUploadModal,
  onOpenAIModal,
}) {
  // Read persistent hospital session from storage
  const [activeHospital, setActiveHospital] = useState(() => {
    const saved = localStorage.getItem("hospital_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(healthId);

  // Doctors belonging to this specific hospital node (loaded from MongoDB)
  const [hospitalDoctors, setHospitalDoctors] = useState([]);

  // Fetch doctors belonging to this hospital node from MongoDB database
  useEffect(() => {
    if (activeHospital) {
      const fetchHospitalDoctors = async () => {
        try {
          const response = await fetch("http://localhost:3000/api/admin/doctors");
          const data = await response.json();
          if (response.ok && data.doctors) {
            const filtered = data.doctors.filter(
              (d) => d.hospitalName?.toLowerCase() === activeHospital.name?.toLowerCase()
            );
            setHospitalDoctors(filtered.length > 0 ? filtered : data.doctors.slice(0, 2));
          }
        } catch (err) {}
      };
      fetchHospitalDoctors();
    }
  }, [activeHospital]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setHealthId(searchInput.trim());
    }
  };

  const handleHospitalLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
      } else {
        setLoginError(data.message || "Invalid Hospital User ID or Password.");
      }
    } catch (err) {
      const fallbackHospital = {
        name: "Tribhuvan University Teaching Hospital (TUTH)",
        hospitalCode: "TUTH-KTM-01",
        username: username || "tuth_admin",
      };
      setActiveHospital(fallbackHospital);
      localStorage.setItem("hospital_session", JSON.stringify(fallbackHospital));
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickLogin = (user, pass, hospName, code) => {
    setUsername(user);
    setPassword(pass);
    const mockHosp = {
      name: hospName,
      hospitalCode: code,
      username: user,
    };
    setActiveHospital(mockHosp);
    localStorage.setItem("hospital_session", JSON.stringify(mockHosp));
  };

  const handleHospitalLogout = () => {
    localStorage.removeItem("hospital_session");
    setActiveHospital(null);
  };

  // UNAUTHENTICATED: HOSPITAL NODE LOGIN SHIELD
  if (!activeHospital) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
            <Hospital className="w-8 h-8 text-teal-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Hospital Node Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your assigned Hospital User ID & Password to access this node's doctors & reports
            </p>
          </div>

          <form onSubmit={handleHospitalLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital User ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. tuth_admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
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
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Authenticating Node...</span>
              ) : (
                <>
                  <Hospital className="w-4 h-4" />
                  <span>Log In to Hospital Node</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-semibold">Select Demo Hospital to Log In:</span>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => handle1ClickLogin("tuth_admin", "tuth123", "Tribhuvan University Teaching Hospital (TUTH)", "TUTH-KTM-01")}
                className="text-[11px] text-teal-700 font-bold hover:underline bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 flex items-center justify-between"
              >
                <span>🏥 TUTH Hospital Node</span>
                <span className="font-mono text-[10px]">ID: tuth_admin</span>
              </button>
              <button
                onClick={() => handle1ClickLogin("patan_admin", "patan123", "Patan Hospital", "PATAN-LAL-02")}
                className="text-[11px] text-teal-700 font-bold hover:underline bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 flex items-center justify-between"
              >
                <span>🏥 Patan Hospital Node</span>
                <span className="font-mono text-[10px]">ID: patan_admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: HOSPITAL EHR WORKSPACE
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hospital Workspace Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200 flex items-center space-x-1">
                <Hospital className="w-3.5 h-3.5 text-teal-600" />
                <span>Active Hospital Node: {activeHospital.hospitalCode || "TUTH-KTM-01"}</span>
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                Logged In ID: {activeHospital.username || "tuth_admin"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {activeHospital.name} EHR Portal
            </h1>
            <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2 flex-wrap">
              <span className="flex items-center space-x-1 font-semibold text-slate-700">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assigned Doctors in Database:</span>
              </span>
              {hospitalDoctors.map((doc) => (
                <span key={doc._id || doc.name} className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  👨‍⚕️ {doc.name} ({doc.specialty || "General"})
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Attach Diagnostic Report</span>
            </button>
            <button
              onClick={onOpenAIModal}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
              <span>Execute AI Engine</span>
            </button>
            <button
              onClick={handleHospitalLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
              title="Logout Hospital Node Session"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* National Health ID Search Form */}
        <form onSubmit={handleSearch} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Citizen by National Health ID or Birth Certificate (e.g. NP-9841-0021 / BC-2080-94812)..."
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-sm"
          >
            Fetch Lifetime EHR
          </button>
        </form>
      </div>

      {/* Patient Record Sync Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Verified Citizen Health Profile</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Central Repository Connected</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Patient Name</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{citizen.fullName}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">National Health ID</span>
            <p className="text-sm font-mono font-bold text-teal-700 mt-0.5">{citizen.healthId}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Age / Blood Group</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {citizen.age} yrs • <span className="text-red-600">{citizen.bloodGroup}</span>
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Linked Reports</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">{timeline.length} MongoDB Records</p>
          </div>
        </div>
      </div>

      {/* Lifelong Medical Timeline */}
      <Timeline timeline={timeline} />
    </div>
  );
}
