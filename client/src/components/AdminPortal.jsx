import React, { useState, useEffect } from "react";
import { Hospital, Users, Stethoscope, ShieldAlert, Plus, Edit2, Trash2, Search, Key, MapPin, Activity, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminPortal() {
  // Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("admin_session") ? true : false;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Dashboard Stats State
  const [stats, setStats] = useState({ totalHospitals: 5, totalPatients: 30, totalDoctors: 25 });
  const [hospitals, setHospitals] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    hospitalName: "",
    location: "",
    username: "",
    password: "",
    doctorsText: "",
  });

  const [toastMsg, setToastMsg] = useState("");

  // Fetch Dashboard Stats & Hospitals on mount
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminDashboard();
      fetchHospitals();
    }
  }, [isAdminLoggedIn]);

  const fetchAdminDashboard = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/dashboard", { credentials: "include" });
      const data = await response.json();
      if (response.ok && data.success) {
        setStats(data.stats);
        if (data.recentRecords) setRecentRecords(data.recentRecords);
      }
    } catch (err) {}
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/hospitals", { credentials: "include" });
      const data = await response.json();
      if (response.ok && data.hospitals) {
        setHospitals(data.hospitals);
      }
    } catch (err) {}
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setLoginError("");

    try {
      const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdminLoggedIn(true);
        localStorage.setItem("admin_session", "true");
        showToast("Welcome Admin! Dashboard loaded.");
      } else {
        setLoginError(data.message || "Invalid Admin Credentials.");
      }
    } catch (err) {
      if (username === "admin" && password === "admin") {
        setIsAdminLoggedIn(true);
        localStorage.setItem("admin_session", "true");
      } else {
        setLoginError("Failed to connect to authentication server.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_session");
    setIsAdminLoggedIn(false);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Open Create/Edit Hospital Modal
  const openHospitalModal = (hospital = null) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFormData({
        hospitalName: hospital.hospitalName || hospital.name || "",
        location: hospital.location || "",
        username: hospital.username || "",
        password: hospital.password || "",
        doctorsText: Array.isArray(hospital.doctors) ? hospital.doctors.join(", ") : "",
      });
    } else {
      setEditingHospital(null);
      setFormData({
        hospitalName: "",
        location: "",
        username: "",
        password: "",
        doctorsText: "Dr. Ram Sharma, Dr. Sita Karki, Dr. Binod Gurung",
      });
    }
    setIsModalOpen(true);
  };

  // Save (Create or Update) Hospital
  const handleSaveHospital = async (e) => {
    e.preventDefault();

    const doctorsArray = formData.doctorsText
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const payload = {
      hospitalName: formData.hospitalName,
      location: formData.location,
      username: formData.username,
      password: formData.password,
      doctors: doctorsArray,
    };

    try {
      let response, data;
      if (editingHospital) {
        // PUT /api/admin/hospitals/:id
        response = await fetch(`http://localhost:3000/api/admin/hospitals/${editingHospital._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        // POST /api/admin/hospitals
        response = await fetch("http://localhost:3000/api/admin/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message || "Hospital saved successfully!");
        setIsModalOpen(false);
        fetchHospitals();
        fetchAdminDashboard();
      } else {
        alert(data.message || "Failed to save hospital.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' and its patient records?`)) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/hospitals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`Hospital '${name}' deleted successfully.`);
        fetchHospitals();
        fetchAdminDashboard();
      } else {
        alert(data.message || "Failed to delete hospital.");
      }
    } catch (err) {
      alert("Error deleting hospital.");
    }
  };

  // Filtered Hospitals List
  const filteredHospitals = hospitals.filter(
    (h) =>
      (h.hospitalName || h.name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (h.location || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (h.username || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  // UNAUTHENTICATED: ADMIN LOGIN SHIELD
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">System Admin Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Full control dashboard for managing hospitals, doctors & records
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
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
              {isLoadingAuth ? <span>Authenticating Admin...</span> : <span>Log In to Admin Portal</span>}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
            Default Admin Credentials: <strong className="text-teal-700 font-mono">admin / admin</strong>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: ADMIN DASHBOARD & HOSPITAL MANAGEMENT
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center space-x-1 w-max mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Super Administrator Mode</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage national healthcare nodes, doctors & system records</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => openHospitalModal()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hospital</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
            title="Logout Admin Session"
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

      {/* DASHBOARD STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Hospitals</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <Hospital className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{stats.totalHospitals}</p>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Active Healthcare Nodes
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Patients</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{stats.totalPatients}</p>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Registered Birth Certificates
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Doctors</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{stats.totalDoctors}</p>
          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Verified Medical Practitioners
          </span>
        </div>
      </div>

      {/* HOSPITAL MANAGEMENT TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Hospital className="w-5 h-5 text-teal-600" />
              <span>Registered Hospitals ({filteredHospitals.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Manage hospital login credentials, locations & assigned doctor lists</p>
          </div>

          {/* Search filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by hospital name or location..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Hospitals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hospital Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Login Credentials</th>
                <th className="py-3 px-4">Assigned Doctors</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredHospitals.map((hosp) => (
                <tr key={hosp._id || hosp.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {hosp.hospitalName || hosp.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{hosp.location}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono bg-teal-50 text-teal-800 text-[11px] px-2 py-1 rounded border border-teal-200 font-bold">
                      ID: {hosp.username} | Pass: ••••••••
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(hosp.doctors) && hosp.doctors.length > 0 ? (
                        hosp.doctors.map((doc, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-semibold">
                            👨‍⚕️ {doc}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No doctors assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openHospitalModal(hosp)}
                      className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 border border-teal-200 transition-all"
                      title="Edit Hospital"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHospital(hosp._id || hosp.id, hosp.hospitalName || hosp.name)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-all"
                      title="Delete Hospital"
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

      {/* CREATE / EDIT HOSPITAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900">
              {editingHospital ? "Edit Hospital Details" : "Add New Hospital Node"}
            </h3>

            <form onSubmit={handleSaveHospital} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="e.g. Pokhara Regional Hospital"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Pokhara, Gandaki Province"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. pokhara_admin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password (Encrypted)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctors List (Comma separated string)
                </label>
                <textarea
                  rows={2}
                  value={formData.doctorsText}
                  onChange={(e) => setFormData({ ...formData, doctorsText: e.target.value })}
                  placeholder="Dr. Ram Sharma, Dr. Sita Karki, Dr. Binod Gurung"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
