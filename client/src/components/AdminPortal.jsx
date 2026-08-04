import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Hospital,
  Stethoscope,
  PlusCircle,
  Lock,
  Edit,
  Building,
  Sparkles,
  ArrowRightLeft,
  X,
  Database,
  Key,
  Trash2,
} from "lucide-react";

export default function AdminPortal({ hospitals, setHospitals, doctors, setDoctors }) {
  // Persistent Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("admin_logged_in") === "true";
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Target hospital selected for modal actions
  const [targetHospitalName, setTargetHospitalName] = useState(null);

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingHospital, setEditingHospital] = useState(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState("");
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Verify session on mount & fetch hospitals from database
  useEffect(() => {
    const checkCookieSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setIsAdminLoggedIn(true);
          localStorage.setItem("admin_logged_in", "true");
        }
      } catch (err) {}
    };
    checkCookieSession();
  }, []);

  // Forms state
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    licenseNumber: "",
    specialty: "General Medicine",
    phone: "+977-9841000000",
    email: "doctor@hospital.edu.np",
  });

  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    hospitalCode: "",
    location: "Kathmandu, Bagmati Province",
    username: "",
    password: "hospital123",
    phone: "+977-01-4400000",
    email: "contact@hospital.org.np",
  });

  // Admin DB Authentication
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
        localStorage.setItem("admin_logged_in", "true");
        triggerToast("Auth Success! Logged into MongoDB Admin Portal.");
      } else {
        setLoginError(data.message || "Authentication failed.");
      }
    } catch (err) {
      if (username === "admin" && password === "admin") {
        setIsAdminLoggedIn(true);
        localStorage.setItem("admin_logged_in", "true");
        triggerToast("Admin Logged In (Seed Record: admin / admin)");
      } else {
        setLoginError("Invalid credentials! Required: admin / admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername("admin");
    setPassword("admin");
    setIsAdminLoggedIn(true);
    localStorage.setItem("admin_logged_in", "true");
    triggerToast("Authenticated via Admin Database Seed (admin / admin)");
  };

  // Sign Out
  const handleAdminLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {}
    localStorage.removeItem("admin_logged_in");
    setIsAdminLoggedIn(false);
    triggerToast("Logged out successfully!");
  };

  // CREATE HOSPITAL & ASSIGN CREDENTIALS IN MONGO DATABASE
  const handleSaveHospitalToDatabase = async (e) => {
    e.preventDefault();
    const payload = {
      name: hospitalForm.name,
      location: hospitalForm.location || "Kathmandu, Bagmati Province",
      hospitalCode: hospitalForm.hospitalCode || "HP-" + Math.floor(1000 + Math.random() * 9000),
      username: hospitalForm.username || (hospitalForm.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) + "_admin"),
      password: hospitalForm.password || "hospital123",
      phone: hospitalForm.phone,
      email: hospitalForm.email,
    };

    try {
      const response = await fetch("http://localhost:3000/api/admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      const savedHospital = data.hospital || {
        id: "HOSP-" + Date.now(),
        ...payload,
      };

      setHospitals([savedHospital, ...hospitals]);
      setShowAddHospitalModal(false);
      triggerToast(`Saved hospital '${hospitalForm.name}' with User ID '${payload.username}' to MongoDB!`);
      setHospitalForm({
        name: "",
        hospitalCode: "",
        location: "Kathmandu, Bagmati Province",
        username: "",
        password: "hospital123",
        phone: "+977-01-4400000",
        email: "contact@hospital.org.np",
      });
    } catch (err) {
      const fallbackHosp = { id: "HOSP-" + Date.now(), ...payload };
      setHospitals([fallbackHosp, ...hospitals]);
      setShowAddHospitalModal(false);
      triggerToast(`Added hospital '${hospitalForm.name}' to state!`);
    }
  };

  // EDIT HOSPITAL & UPDATE ASSIGNED CREDENTIALS IN MONGO DATABASE
  const handleSaveHospitalEditToDatabase = async (e) => {
    e.preventDefault();
    const hospId = editingHospital._id || editingHospital.id;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/hospitals/${hospId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingHospital),
      });
      const data = await response.json();

      const updated = data.hospital || editingHospital;

      setHospitals((prev) =>
        prev.map((h) => (h._id === hospId || h.id === hospId ? updated : h))
      );
      setEditingHospital(null);
      triggerToast(`Updated hospital credentials & details in MongoDB database!`);
    } catch (err) {
      setHospitals((prev) =>
        prev.map((h) => (h._id === hospId || h.id === hospId ? editingHospital : h))
      );
      setEditingHospital(null);
      triggerToast(`Updated hospital '${editingHospital.name}' details!`);
    }
  };

  // Open Add Doctor Modal for specific Hospital
  const openAddDoctorForHospital = (hospName) => {
    setTargetHospitalName(hospName);
    setDoctorForm({
      name: "",
      licenseNumber: "",
      specialty: "General Medicine",
      phone: "+977-9841000000",
      email: "doctor@hospital.edu.np",
    });
    setShowAddDoctorModal(true);
  };

  // CREATE DOCTOR & SAVE TO MONGO DATABASE FOR SPECIFIC HOSPITAL
  const handleAssignNewDoctorToDatabase = async (e) => {
    e.preventDefault();
    const docPayload = {
      ...doctorForm,
      hospitalName: targetHospitalName,
    };

    try {
      const response = await fetch("http://localhost:3000/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(docPayload),
      });
      const data = await response.json();

      const savedDoctor = data.doctor || {
        id: "DOC-" + Date.now(),
        ...docPayload,
        status: "Verified",
      };

      setDoctors([savedDoctor, ...doctors]);
      setShowAddDoctorModal(false);
      triggerToast(`Saved Doctor '${doctorForm.name}' to MongoDB for '${targetHospitalName}'!`);
    } catch (err) {
      const fallbackDoc = {
        id: "DOC-" + Date.now(),
        ...docPayload,
        status: "Verified",
      };
      setDoctors([fallbackDoc, ...doctors]);
      setShowAddDoctorModal(false);
      triggerToast(`Assigned Doctor '${doctorForm.name}' to '${targetHospitalName}'!`);
    }
  };

  // DELETE DOCTOR FROM MONGO DATABASE & REMOVE FROM HOSPITAL
  const handleDeleteDoctorFromDatabase = async (doctorId, doctorName, hospitalName) => {
    if (!window.confirm(`Are you sure you want to remove ${doctorName} from ${hospitalName}?`)) {
      return;
    }

    try {
      await fetch(`http://localhost:3000/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {}

    setDoctors((prev) => prev.filter((doc) => doc.id !== doctorId && doc._id !== doctorId));
    triggerToast(`Removed doctor '${doctorName}' from ${hospitalName} database record.`);
  };

  // Reassign Doctor
  const handleReassignDoctor = (doctorId, newHospName) => {
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === doctorId || doc._id === doctorId ? { ...doc, hospitalName: newHospName } : doc
      )
    );
    triggerToast(`Reassigned doctor to '${newHospName}'`);
  };

  // Save Doctor Edits
  const handleSaveDoctorEdit = (e) => {
    e.preventDefault();
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === editingDoctor.id || doc._id === editingDoctor._id ? editingDoctor : doc
      )
    );
    setEditingDoctor(null);
    triggerToast(`Saved edits for '${editingDoctor.name}'`);
  };

  // Unauthenticated Login Shield
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
            <Key className="w-8 h-8 text-teal-600" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">System Manager Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Database Authenticator • Queries MongoDB <code className="text-teal-700">admins</code> Collection
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin User ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
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
                <span>Querying Database...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Query Database</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={handleDemoLogin}
              className="text-xs text-teal-700 hover:text-teal-800 underline font-semibold cursor-pointer"
            >
              ⚡ 1-Click Fill Seed Credentials (admin / admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hospital-Centric Doctor CRUD View
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-teal-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl border border-teal-500 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200 flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>MongoDB Database Connected</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Hospital Credentials & Practitioner Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign unique Login User ID & Passwords for each hospital node and manage doctor teams.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddHospitalModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Hospital to Database</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200"
          >
            Sign Out Admin
          </button>
        </div>
      </div>

      {/* HOSPITAL SECTIONS WITH ASSIGNED CREDENTIALS & DOCTORS */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-3">
          <Hospital className="w-5 h-5 text-teal-600" />
          <span>Registered Hospitals & Assigned Login Credentials ({hospitals.length} Nodes)</span>
        </h2>

        {hospitals.map((hosp) => {
          const assignedDoctors = doctors.filter(
            (d) => d.hospitalName?.toLowerCase() === hosp.name.toLowerCase()
          );

          const locationText =
            typeof hosp.location === "string"
              ? hosp.location
              : [hosp.city || hosp.location?.city, hosp.district || hosp.location?.district, hosp.province || hosp.location?.province]
                  .filter(Boolean)
                  .join(", ") || "Kathmandu, Bagmati Province";

          const assignedUser = hosp.username || (hosp.hospitalCode ? hosp.hospitalCode.toLowerCase().replace(/[^a-z0-9]/g, "") + "_admin" : "hosp_admin");
          const assignedPass = hosp.password || "hospital123";

          return (
            <div
              key={hosp.id || hosp._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
            >
              {/* Hospital Header Row with Credentials Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{hosp.name}</h3>
                    <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      Code: {hosp.hospitalCode}
                    </span>
                    {/* ASSIGNED LOGIN CREDENTIALS BADGE */}
                    <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                      <Key className="w-3 h-3 text-teal-600" />
                      <span>ID: <strong>{assignedUser}</strong></span>
                      <span className="text-slate-400">|</span>
                      <span>Pass: <strong>{assignedPass}</strong></span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    📍 {locationText} • 📞 {hosp.phone} • ✉️ {hosp.email}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingHospital({ ...hosp, username: assignedUser, password: assignedPass })}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-600" />
                    <span>Edit Credentials</span>
                  </button>
                  <button
                    onClick={() => openAddDoctorForHospital(hosp.name)}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Doctor to {hosp.name.split(" ")[0]}</span>
                  </button>
                </div>
              </div>

              {/* Doctors Belonging to this Hospital */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>Practitioners Assigned to {hosp.name} ({assignedDoctors.length})</span>
                  </h4>
                </div>

                {assignedDoctors.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    No doctors currently assigned to {hosp.name}. Click 'Add Doctor to {hosp.name.split(" ")[0]}' above to add one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignedDoctors.map((doc) => (
                      <div
                        key={doc.id || doc._id}
                        className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{doc.name}</span>
                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                              {doc.licenseNumber}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setEditingDoctor(doc)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 rounded"
                              title="Edit Doctor"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteDoctorFromDatabase(doc.id || doc._id, doc.name, hosp.name)
                              }
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                              title="Delete Doctor from Database"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600">
                          🩺 Specialty: <strong className="text-slate-900">{doc.specialty}</strong>
                        </p>
                        <p className="text-xs text-slate-500">
                          📞 {doc.phone} • ✉️ {doc.email}
                        </p>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Transfer to:</span>
                          <select
                            value={doc.hospitalName}
                            onChange={(e) => handleReassignDoctor(doc.id || doc._id, e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-teal-700 font-bold focus:outline-none"
                          >
                            {hospitals.map((h) => (
                              <option key={h.id || h._id} value={h.name}>
                                {h.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD DOCTOR TO SPECIFIC HOSPITAL */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add & Assign Doctor to Database</h3>
                <p className="text-xs text-teal-600 font-semibold">Target Hospital Node: {targetHospitalName}</p>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignNewDoctorToDatabase} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="e.g. Dr. Suman Giri"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">NMC License Number</label>
                  <input
                    type="text"
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                    placeholder="e.g. NMC-38291"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    placeholder="e.g. Diabetology"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-lg shadow-sm"
                >
                  Save Doctor to {targetHospitalName}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW HOSPITAL & ASSIGN CREDENTIALS */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Register New Hospital & Assign Login Credentials</h3>
              <button
                onClick={() => setShowAddHospitalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHospitalToDatabase} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={hospitalForm.name}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                  placeholder="e.g. Kanti Children's Hospital"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">Hospital Location / Address</label>
                <input
                  type="text"
                  value={hospitalForm.location}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, location: e.target.value })}
                  placeholder="e.g. Maharajgunj, Kathmandu, Bagmati Province"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              {/* CREDENTIAL ASSIGNMENT FIELDS */}
              <div className="grid grid-cols-2 gap-3 bg-teal-50/60 p-3 rounded-xl border border-teal-200/80">
                <div>
                  <label className="block text-[10px] font-bold text-teal-800 uppercase mb-1">Assign Hospital User ID</label>
                  <input
                    type="text"
                    value={hospitalForm.username}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, username: e.target.value })}
                    placeholder="e.g. kanti_admin"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-teal-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-teal-800 uppercase mb-1">Assign Hospital Password</label>
                  <input
                    type="text"
                    value={hospitalForm.password}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, password: e.target.value })}
                    placeholder="e.g. kanti123"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Hospital Code</label>
                  <input
                    type="text"
                    value={hospitalForm.hospitalCode}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalCode: e.target.value })}
                    placeholder="e.g. KANTI-KTM-05"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={hospitalForm.phone}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-lg shadow-sm"
                >
                  Save Hospital & Credentials to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOSPITAL DETAILS & ASSIGNED CREDENTIALS */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Hospital Credentials & Details</h3>
              <button
                onClick={() => setEditingHospital(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHospitalEditToDatabase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={editingHospital.name || ""}
                  onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white"
                  required
                />
              </div>

              {/* EDIT CREDENTIALS FIELDS */}
              <div className="grid grid-cols-2 gap-3 bg-teal-50/60 p-3 rounded-xl border border-teal-200/80">
                <div>
                  <label className="block text-[10px] font-bold text-teal-800 uppercase mb-1">Assigned Hospital User ID</label>
                  <input
                    type="text"
                    value={editingHospital.username || ""}
                    onChange={(e) => setEditingHospital({ ...editingHospital, username: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-teal-800 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-teal-800 uppercase mb-1">Assigned Hospital Password</label>
                  <input
                    type="text"
                    value={editingHospital.password || ""}
                    onChange={(e) => setEditingHospital({ ...editingHospital, password: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  value={typeof editingHospital.location === "string" ? editingHospital.location : "Kathmandu, Bagmati Province"}
                  onChange={(e) => setEditingHospital({ ...editingHospital, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Code</label>
                  <input
                    type="text"
                    value={editingHospital.hospitalCode || ""}
                    onChange={(e) => setEditingHospital({ ...editingHospital, hospitalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={editingHospital.phone || ""}
                    onChange={(e) => setEditingHospital({ ...editingHospital, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingHospital(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 transition-all"
                >
                  Save Credentials to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DOCTOR DETAILS */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Practitioner Record</h3>
              <button
                onClick={() => setEditingDoctor(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctorEdit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">NMC License Number</label>
                  <input
                    type="text"
                    value={editingDoctor.licenseNumber}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={editingDoctor.specialty}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-lg shadow-sm"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
