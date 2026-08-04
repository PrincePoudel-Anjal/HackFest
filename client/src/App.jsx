import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
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

function MainApp() {
  const [healthId, setHealthId] = useState("BC-2080-94812");
  const [citizen] = useState(MOCK_CITIZEN);
  const [timeline, setTimeline] = useState(MOCK_TIMELINE);
  const [aiData, setAiData] = useState(MOCK_AI_ANALYSIS);

  const [hospitals, setHospitals] = useState(MOCK_HOSPITALS);
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Fetch Hospitals and Doctors directly from MongoDB Backend API on mount
  useEffect(() => {
    const fetchDatabaseRecords = async () => {
      try {
        const hospRes = await fetch("http://localhost:3000/api/admin/hospitals");
        const hospData = await hospRes.json();
        if (hospRes.ok && hospData.hospitals && hospData.hospitals.length > 0) {
          setHospitals(hospData.hospitals);
        }

        const docRes = await fetch("http://localhost:3000/api/admin/doctors");
        const docData = await docRes.json();
        if (docRes.ok && docData.doctors && docData.doctors.length > 0) {
          setDoctors(docData.doctors);
        }
      } catch (err) {}
    };

    fetchDatabaseRecords();
  }, []);

  const handleAddReport = (newEvent) => {
    setTimeline((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white flex flex-col">
      <Routes>
        {/* Landing Page Route "/" */}
        <Route path="/" element={<LandingPage />} />

        {/* Patient Portal Route "/patient" */}
        <Route
          path="/patient"
          element={
            <>
              <PortalNavbar activeTab="citizen" healthId={healthId} setHealthId={setHealthId} />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CitizenPortal citizen={citizen} timeline={timeline} aiData={aiData} healthId={healthId} setHealthId={setHealthId} />
              </main>
              <PortalFooter />
            </>
          }
        />

        {/* Hospital Portal Route "/hospital" */}
        <Route
          path="/hospital"
          element={
            <>
              <PortalNavbar activeTab="hospital" healthId={healthId} setHealthId={setHealthId} />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <HospitalPortal
                  citizen={citizen}
                  timeline={timeline}
                  aiData={aiData}
                  healthId={healthId}
                  setHealthId={setHealthId}
                  onOpenUploadModal={() => setIsUploadOpen(true)}
                  onOpenAIModal={() => setIsAIOpen(true)}
                />
              </main>
              <PortalFooter />
            </>
          }
        />

        {/* Admin Portal Route "/admin" */}
        <Route
          path="/admin"
          element={
            <>
              <PortalNavbar activeTab="admin" healthId={healthId} setHealthId={setHealthId} />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdminPortal
                  hospitals={hospitals}
                  setHospitals={setHospitals}
                  doctors={doctors}
                  setDoctors={setDoctors}
                />
              </main>
              <PortalFooter />
            </>
          }
        />
      </Routes>

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

function PortalNavbar({ activeTab, healthId, setHealthId }) {
  const navigate = useNavigate();

  return (
    <Navbar
      activePortal={activeTab}
      setActivePortal={(tab) => {
        if (tab === "citizen") navigate("/patient");
        else if (tab === "hospital") navigate("/hospital");
        else if (tab === "admin") navigate("/admin");
      }}
      healthId={healthId}
      setHealthId={setHealthId}
    />
  );
}

function PortalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <p>
        LifeTrack Nepal – National AI Health Intelligence Platform •{" "}
        <span className="text-teal-600 font-semibold">One Citizen. One Lifetime Record.</span>
      </p>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
