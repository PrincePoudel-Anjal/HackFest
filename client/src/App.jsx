import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CitizenPortal from "./components/CitizenPortal";
import HospitalPortal from "./components/HospitalPortal";
import AdminPortal from "./components/AdminPortal";
import ReportUploadModal from "./components/ReportUploadModal";
import AIPredictionModal from "./components/AIPredictionModal";
import {
  MOCK_CITIZEN,
  MOCK_TIMELINE,
  MOCK_AI_ANALYSIS,
  MOCK_HOSPITALS,
  MOCK_DOCTORS,
} from "./data/mockData";

export default function App() {
  const [activePortal, setActivePortal] = useState("citizen"); // "citizen" | "hospital" | "admin"
  const [healthId, setHealthId] = useState(MOCK_CITIZEN.healthId);
  const [citizen] = useState(MOCK_CITIZEN);
  const [timeline, setTimeline] = useState(MOCK_TIMELINE);
  const [aiData, setAiData] = useState(MOCK_AI_ANALYSIS);

  // Admin managed state (loaded from MongoDB API)
  const [hospitals, setHospitals] = useState(MOCK_HOSPITALS);
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);

  // Modal open states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Fetch Hospitals and Doctors directly from MongoDB Backend API on mount
  useEffect(() => {
    const fetchDatabaseRecords = async () => {
      try {
        const hospRes = await fetch("http://localhost:3000/api/admin/hospitals");
        const hospData = await hospRes.json();
        if (hospRes.ok && hospData.hospitals && hospData.hospitals.length > 0) {
          const formattedHospitals = hospData.hospitals.map((h) => ({
            id: h._id || h.id,
            name: h.name,
            hospitalCode: h.hospitalCode,
            province: h.location?.province || h.province || "Bagmati Province",
            district: h.location?.district || h.district || "Kathmandu",
            city: h.location?.city || h.city || "Kathmandu",
            phone: h.phone || "+977-01-4412300",
            email: h.email || "info@hospital.gov.np",
          }));
          setHospitals(formattedHospitals);
        }

        const docRes = await fetch("http://localhost:3000/api/admin/doctors");
        const docData = await docRes.json();
        if (docRes.ok && docData.doctors && docData.doctors.length > 0) {
          const formattedDoctors = docData.doctors.map((d) => ({
            id: d._id || d.id,
            name: d.name,
            licenseNumber: d.licenseNumber,
            specialty: d.specialty,
            hospitalName: d.hospitalName || "Tribhuvan University Teaching Hospital (TUTH)",
            phone: d.phone,
            email: d.email,
          }));
          setDoctors(formattedDoctors);
        }
      } catch (err) {
        console.warn("Backend API offline or connecting, using fallback records:", err);
      }
    };

    fetchDatabaseRecords();
  }, []);

  // Dynamic lab report addition
  const handleAddReport = (newEvent) => {
    setTimeline((prev) => [newEvent, ...prev]);

    setAiData((prev) => ({
      ...prev,
      analyzedRecordsCount: prev.analyzedRecordsCount + 1,
      overallHealthScore: Math.max(65, prev.overallHealthScore - 2),
      explanation: `Updated analysis: New lab report (${newEvent.date}) recorded fasting glucose at ${newEvent.metrics.bloodSugar} mg/dL and HbA1c at ${newEvent.metrics.hba1c}%. Continuous 5-year trend remains elevated.`,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white flex flex-col">
      {/* Navbar with 3 Portals */}
      <Navbar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        healthId={healthId}
        setHealthId={setHealthId}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePortal === "citizen" && (
          <CitizenPortal citizen={citizen} timeline={timeline} aiData={aiData} />
        )}

        {activePortal === "hospital" && (
          <HospitalPortal
            citizen={citizen}
            timeline={timeline}
            aiData={aiData}
            healthId={healthId}
            setHealthId={setHealthId}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onOpenAIModal={() => setIsAIOpen(true)}
          />
        )}

        {activePortal === "admin" && (
          <AdminPortal
            hospitals={hospitals}
            setHospitals={setHospitals}
            doctors={doctors}
            setDoctors={setDoctors}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          LifeTrack Nepal – National AI Health Intelligence Platform •{" "}
          <span className="text-teal-600 font-semibold">One Citizen. One Lifetime Record.</span>
        </p>
      </footer>

      {/* Modals */}
      <ReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddReport={handleAddReport}
        healthId={healthId}
      />
      <AIPredictionModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        aiData={aiData}
        timelineCount={timeline.length}
      />
    </div>
  );
}
