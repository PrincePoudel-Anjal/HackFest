import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Brain,
  Hospital,
  Clock,
  HeartPulse,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Layers,
  Award,
  Zap,
  Globe,
  Database,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTimelineYear, setActiveTimelineYear] = useState(2026);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  // Sample Health Data over 5 Years (2022 -> 2026)
  const timelineData = {
    2022: { ldl: 105, hba1c: 5.2, bp: "118/76", weight: 63, risk: "Optimal", score: 92 },
    2023: { ldl: 120, hba1c: 5.4, bp: "124/80", weight: 65, risk: "Normal", score: 86 },
    2024: { ldl: 132, hba1c: 5.6, bp: "128/82", weight: 68, risk: "Pre-Diabetic Alert", score: 78 },
    2025: { ldl: 148, hba1c: 5.8, bp: "133/85", weight: 70, risk: "Moderate Risk", score: 71 },
    2026: { ldl: 161, hba1c: 6.0, bp: "138/88", weight: 72, risk: "High Risk Warning", score: 65 },
  };

  const currentMetrics = timelineData[activeTimelineYear];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GRADIENT GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-teal-100/50 via-emerald-50/30 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[40%] -right-48 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[70%] -left-48 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. STICKY NAVBAR                                         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">LifeTrack Nepal</span>
                <span className="bg-teal-50 text-teal-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wide">
                  EHR MVP Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-tight hidden sm:block">
                National Health Intelligence & Healthcare Record System
              </p>
            </div>
          </div>

          {/* Right Portal Switcher Navigation Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => navigate("/patient")}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>

            <button
              onClick={() => navigate("/hospital")}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Hospital className="w-3.5 h-3.5 text-teal-600" />
              <span>Hospital Portal</span>
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                          */}
      {/* ========================================================= */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text Content */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <span className="text-xs font-bold text-teal-900">National Healthcare Infrastructure Project</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              One Lifetime. <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                One Health Record.
              </span> <br />
              Smarter Healthcare.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
              Store every medical record from birth to old age in one secure platform while AI continuously analyzes health trends to help detect disease risks earlier.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById("portal-selection");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-teal-600/25 transition-all flex items-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all"
              >
                Learn More
              </button>
            </motion.div>

            {/* Live Stats */}
            <motion.div variants={fadeInUp} className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <span className="text-2xl font-black text-slate-900 font-mono">100%</span>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">MongoDB Unified</p>
              </div>
              <div>
                <span className="text-2xl font-black text-teal-700 font-mono">5</span>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">National Hospitals</p>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-700 font-mono">24/7</span>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">AI CDSS Analytics</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column Healthcare Illustration & Floating Cards */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto max-w-md bg-gradient-to-tr from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">National Health Passport</h4>
                    <p className="text-[11px] font-mono text-teal-700">Health ID: NP-2026-8845</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Patient Badge */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Citizen Identity</span>
                  <span className="font-bold text-slate-900">Bishal Sharma</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Birth Certificate</span>
                  <span className="font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">BC-2083-99999</span>
                </div>
              </div>

              {/* Floating Card 1: Medical Reports */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Medical Reports</span>
                  <span className="text-[11px] text-slate-500 font-semibold">HbA1c & Fasting Glucose Tracked</span>
                </div>
              </motion.div>

              {/* Floating Card 2: AI Analysis */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="bg-gradient-to-r from-teal-900 to-slate-900 p-4 rounded-2xl text-white shadow-xl space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center space-x-1.5 text-teal-300">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <span>LifeTrack AI Engine</span>
                  </span>
                  <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded font-mono font-bold">94% Precision</span>
                </div>
                <p className="text-xs text-slate-200 font-medium">Continuous CDSS CDSS Trajectory: Pre-Diabetic Early Warning</p>
              </motion.div>

              {/* Floating Card 3: Hospital Network */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center space-x-1 font-semibold">
                  <Hospital className="w-4 h-4 text-teal-600" />
                  <span>5 Hospital Nodes Linked</span>
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Synchronized</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURES (SIX PREMIUM CARDS)                          */}
      {/* ========================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-extrabold border border-teal-200 uppercase tracking-wider">
            National EHR Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Citizens, Doctors & Health Authorities
          </h2>
          <p className="text-slate-600 text-base font-medium">
            A comprehensive digital health ecosystem replacing fragmented paper records with a single normalized database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Digital Health Record",
              desc: "Lifelong centralized cloud repository preserving every clinical report from birth certificate registration to senior care.",
              badge: "Central Repository",
            },
            {
              icon: ShieldCheck,
              title: "Secure National Health ID",
              desc: "Encrypted National Health ID automatically generated for every newborn and linked to official birth certificates.",
              badge: "Birth Cert Linked",
            },
            {
              icon: Brain,
              title: "AI Disease Risk Prediction",
              desc: "Longitudinal clinical decision support system analyzing multi-year lab metrics to predict diabetes & cardiac risks.",
              badge: "Explainable AI",
            },
            {
              icon: Hospital,
              title: "Hospital Integration",
              desc: "Instant EHR synchronization across regional and central referral hospitals with complete tenant data isolation.",
              badge: "Tenant Isolated",
            },
            {
              icon: Clock,
              title: "Medical Timeline",
              desc: "Chronological visit tree ordering diagnostic reports from newest to oldest for fast clinical decision-making.",
              badge: "Chronological",
            },
            {
              icon: HeartPulse,
              title: "Emergency Health Access",
              desc: "Instant lookup by birth certificate number providing emergency physicians immediate blood group & allergy data.",
              badge: "24/7 Access",
            },
          ].map((item, index) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all space-y-4 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HOW IT WORKS (FOUR ANIMATED STEPS)                   */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 rounded-3xl">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 uppercase tracking-wider">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How LifeTrack Nepal Works
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Four simple steps connecting citizens, hospitals, and national health intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: "1",
              title: "Visit Hospital",
              desc: "Citizen arrives at any registered hospital node with their Birth Certificate Number or Health ID.",
              icon: Hospital,
            },
            {
              step: "2",
              title: "Upload Reports",
              desc: "Hospital staff perform citizen lookup and upload verified diagnostic symptoms, diagnosis, and prescriptions.",
              icon: FileText,
            },
            {
              step: "3",
              title: "AI Analysis",
              desc: "LifeTrack AI Engine continuously monitors 5-year longitudinal trends for early risk trajectories.",
              icon: Brain,
            },
            {
              step: "4",
              title: "Preventive Insights",
              desc: "Citizen views complete medical timeline & receives preventive CDSS health recommendations.",
              icon: HeartPulse,
            },
          ].map((s, idx) => {
            const StepIcon = s.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative text-left">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-teal-600/20">
                    {s.step}
                  </span>
                  <StepIcon className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">{s.title}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. AI HEALTH TIMELINE SECTION                             */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-extrabold border border-teal-200 uppercase tracking-wider">
            Predictive Health Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            5-Year AI Health Trajectory Engine
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Interactive timeline tracking longitudinal biological markers to detect pre-clinical disease progression.
          </p>
        </div>

        {/* Timeline Selector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-8">
          
          {/* Year Buttons Row */}
          <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto overflow-x-auto pb-2">
            {[2022, 2023, 2024, 2025, 2026].map((year) => (
              <button
                key={year}
                onClick={() => setActiveTimelineYear(year)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
                  activeTimelineYear === year
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{year}</span>
              </button>
            ))}
          </div>

          {/* Metrics & Risk Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Health Metrics Display */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">LDL Cholesterol</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{currentMetrics.ldl} <span className="text-xs font-semibold text-slate-500">mg/dL</span></p>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-2 inline-block">
                  Rising Trend
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">HbA1c Glycemic</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{currentMetrics.hba1c}%</p>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 mt-2 inline-block">
                  Pre-Diabetic Range
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Blood Pressure</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{currentMetrics.bp} <span className="text-xs font-semibold text-slate-500">mmHg</span></p>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-2 inline-block">
                  Stage 1 Warning
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Weight Trajectory</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{currentMetrics.weight} <span className="text-xs font-semibold text-slate-500">kg</span></p>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded mt-2 inline-block">
                  +9 kg over 5 yrs
                </span>
              </div>
            </div>

            {/* AI Analysis Result Card */}
            <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-teal-950 p-6 rounded-3xl text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-teal-400 animate-pulse" />
                  <h4 className="text-sm font-black text-white">AI Risk Detection Output</h4>
                </div>
                <span className="text-xs font-mono text-teal-300 bg-teal-900/60 px-2.5 py-1 rounded-lg border border-teal-700">
                  Year {activeTimelineYear}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "LifeTrack AI detected increasing cardiovascular and diabetes risk based on long-term trends."
              </p>

              {/* Risk Indicators Progress Bars */}
              <div className="space-y-2.5 pt-2">
                {[
                  { name: "Heart Disease", risk: 78, color: "bg-red-500" },
                  { name: "Diabetes", risk: 68, color: "bg-amber-500" },
                  { name: "Hypertension", risk: 62, color: "bg-amber-500" },
                  { name: "Kidney Disease", risk: 18, color: "bg-emerald-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>{item.name}</span>
                      <span>{item.risk}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.risk}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BENEFITS SECTION                                      */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 uppercase tracking-wider">
            National Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Key Benefits of LifeTrack Nepal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Early Disease Detection", desc: "Identifies clinical risks years before onset through longitudinal CDSS analytics." },
            { title: "Preventive Healthcare", desc: "Empowers citizens with personalized health scores and actionable lifestyle recommendations." },
            { title: "Lifetime Medical History", desc: "Preserves complete medical timeline from newborn registration to senior care." },
            { title: "Better Clinical Decisions", desc: "Provides doctors instant access to past diagnostic records across hospitals." },
            { title: "National Healthcare Intelligence", desc: "Gives health authorities real-time epidemic and non-communicable disease metrics." },
            { title: "AI Powered Insights", desc: "Explainable AI rationale explaining clinical risk calculations clearly to patients." },
          ].map((b, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-left">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{b.title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PORTAL SELECTION (THREE BEAUTIFUL GLASS CARDS)        */}
      {/* ========================================================= */}
      <section id="portal-selection" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-extrabold border border-teal-200 uppercase tracking-wider">
            Choose Your Workspace
          </span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Access LifeTrack Nepal Portals
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Select your portal to enter your dedicated healthcare workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PATIENT PORTAL CARD */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-gradient-to-b from-white via-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between text-left"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">PATIENT PORTAL</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Log in with your Birth Certificate Number to view your lifelong health passport and AI insights.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>View Diagnostic Reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>AI Risk Trajectory Insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Chronological Medical Timeline</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/patient")}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Enter Patient Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* HOSPITAL PORTAL CARD */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-gradient-to-b from-white via-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between text-left"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Hospital className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">HOSPITAL PORTAL</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Hospital staff workspace to register newborns, lookup citizens, and record patient visits.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Newborn Registration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart Citizen Lookup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assign Doctor & Create Visit Record</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/hospital")}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Enter Hospital Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* ADMIN PORTAL CARD */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-gradient-to-b from-white via-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between text-left"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">ADMIN PORTAL</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                System Admin dashboard for national hospital node directory management and MongoDB metrics.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>National Health Dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Hospital CRUD & Doctor Rosters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>MongoDB Live Data Analytics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Enter Admin Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">LifeTrack Nepal</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Government of Nepal inspired healthcare branding. National AI Health Intelligence & Electronic Health Record Platform.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3">Portals</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><button onClick={() => navigate("/patient")} className="hover:text-teal-600">Patient Portal</button></li>
              <li><button onClick={() => navigate("/hospital")} className="hover:text-teal-600">Hospital Portal</button></li>
              <li><button onClick={() => navigate("/admin")} className="hover:text-teal-600">Admin Portal</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3">Quick Links</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><a href="#features" className="hover:text-teal-600">Features</a></li>
              <li><a href="#portal-selection" className="hover:text-teal-600">Workspaces</a></li>
              <li><span className="hover:text-teal-600 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-teal-600 cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3">Contact</h5>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Ministry of Health & Population <br />
              Kathmandu, Nepal <br />
              info@lifetrack.gov.np
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 mt-8 pt-6 text-center text-xs text-slate-400 font-semibold">
          © 2026 LifeTrack Nepal. All Rights Reserved. • <span className="text-teal-600">One Citizen. One Lifetime Record.</span>
        </div>
      </footer>
    </div>
  );
}
