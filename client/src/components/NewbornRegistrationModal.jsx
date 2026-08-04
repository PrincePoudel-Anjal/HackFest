import React, { useState } from "react";
import { X, Baby, User, Calendar, Phone, MapPin, AlertCircle, CheckCircle2, ShieldCheck, HeartPulse } from "lucide-react";

export default function NewbornRegistrationModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "Bishal Sharma",
    birthCertificateNumber: "BC-2083-" + Math.floor(10000 + Math.random() * 90000),
    healthId: "NP-2026-" + Math.floor(1000 + Math.random() * 9000),
    dob: "2026-08-04",
    gender: "Male",
    bloodGroup: "O+",
    fatherName: "Ram Kumar Sharma",
    motherName: "Sita Kumari Sharma",
    phone: "+977-9841234567",
    province: "Bagmati Province",
    district: "Kathmandu",
    city: "Kathmandu",
    emergencyContactName: "Ram Kumar Sharma",
    emergencyContactPhone: "+977-9841234567",
    emergencyContactRelation: "Father",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validations
    if (!formData.fullName.trim()) {
      setErrorMsg("Full Name is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.birthCertificateNumber.trim()) {
      setErrorMsg("Birth Certificate Number is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.dob) {
      setErrorMsg("Date of Birth is required.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      birthCertificateNumber: formData.birthCertificateNumber.trim(),
      healthId: formData.healthId.trim(),
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      fatherName: formData.fatherName.trim(),
      motherName: formData.motherName.trim(),
      phone: formData.phone.trim(),
      province: formData.province.trim(),
      district: formData.district.trim(),
      city: formData.city.trim(),
      emergencyContactName: formData.emergencyContactName.trim(),
      emergencyContactPhone: formData.emergencyContactPhone.trim(),
      emergencyContactRelation: formData.emergencyContactRelation.trim(),
    };

    try {
      const response = await fetch("http://localhost:3000/api/citizens/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || `Newborn '${formData.fullName}' officially registered in national system!`);
        if (onRegisterSuccess) onRegisterSuccess(data.citizen);

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to register newborn.");
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
              <Baby className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Newborn Registration</h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center space-x-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Register newborn into National Health Repository</span>
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

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECTION 1: Newborn Identity & Identifiers */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <User className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                1. Newborn Identity & National Unique Identifiers
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Bishal Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birth Certificate Number (Unique) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.birthCertificateNumber}
                  onChange={(e) => setFormData({ ...formData, birthCertificateNumber: e.target.value })}
                  placeholder="e.g. BC-2083-94812"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Health ID (Auto-Generated)</label>
                <input
                  type="text"
                  value={formData.healthId}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-teal-800 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Gender <span className="text-red-500">*</span></label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-red-600 font-bold"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Parent & Family Details */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                2. Parent Details & Guardian Contact
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Father Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Ram Kumar Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Mother Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="e.g. Sita Kumari Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Address & Emergency Contact */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                3. Address Location & Emergency Contact
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">City / Municipality</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Emergency Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Relation</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Registering Newborn...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Newborn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
