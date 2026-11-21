import React, { useState, useEffect, useCallback } from "react";
import PortalHub from "./components/PortalHub";
import HospitalPortal from "./components/HospitalPortal";
import DoctorPortal from "./components/DoctorPortal";
import PatientPortal from "./components/PatientPortal";
import Toast from "./components/Toast";
import AiAssistantModal from "./components/AiAssistantModal";
import doctorService from "./services/doctorService";
import patientService from "./services/patientService";
import appointmentService from "./services/appointmentService";
import { Building2, Stethoscope, User, LayoutGrid, Bot, Sparkles } from "lucide-react";
import SpecularButton from "./components/SpecularButton";
import "./App.css";
import "./glass.css";

export function App() {
  // Detect starting portal from URL pathname, hash, query, or port
  const getInitialPortal = () => {
    const envPortal = import.meta.env.VITE_PORTAL;
    if (envPortal) return envPortal.toLowerCase();

    const port = window.location.port;
    if (port === "5174") return "doctor";
    if (port === "5175") return "patient";

    const params = new URLSearchParams(window.location.search);
    const qPortal = params.get("portal");
    if (qPortal) return qPortal.toLowerCase();

    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/doctor")) return "doctor";
    if (path.startsWith("/patient") || path.startsWith("/user")) return "patient";
    if (path.startsWith("/hospital") || path.startsWith("/admin")) return "hospital";

    const hash = window.location.hash.toLowerCase().replace("#/", "").replace("#", "");
    if (hash === "doctor") return "doctor";
    if (hash === "patient" || hash === "user") return "patient";
    if (hash === "hospital" || hash === "admin") return "hospital";

    return "hub";
  };

  const [currentPortal, setCurrentPortal] = useState(getInitialPortal);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toast, setToast] = useState(null);

  // Floating AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Show Toast Helper
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // Fetch all hospital master data
  const loadAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [docsRes, patientsRes, appsRes] = await Promise.all([
        doctorService.getAll().catch(() => []),
        patientService.getAll().catch(() => []),
        appointmentService.getAll().catch(() => []),
      ]);

      setDoctors(Array.isArray(docsRes) ? docsRes : []);
      setPatients(Array.isArray(patientsRes) ? patientsRes : []);
      setAppointments(Array.isArray(appsRes) ? appsRes : []);
      setBackendOnline(true);

      if (!silent) {
        showToast("success", "Synchronized records with TiDB Cloud server.");
      }
    } catch (err) {
      setBackendOnline(false);
      showToast(
        "error",
        "Could not connect to DocTime API on port 1080. Please ensure Spring Boot is running."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  // Navigate to portal with URL sync
  const handleNavigatePortal = (portalId) => {
    setCurrentPortal(portalId);
    if (portalId === "hub") {
      window.history.pushState(null, "", "/");
    } else {
      window.history.pushState(null, "", `/${portalId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPortal(getInitialPortal());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="doctime-root-app">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Floating Global Portal Switcher (Quick Nav) */}
      <nav className="global-portal-bar">
        <div className="global-brand" onClick={() => handleNavigatePortal("hub")}>
          <span className="dot active"></span>
          <strong>DocTime</strong>
          <small>AI-Powered Healthcare</small>
        </div>

        <div className="global-nav-links">
          <button
            className={`g-nav-btn ${currentPortal === "hub" ? "active" : ""}`}
            onClick={() => handleNavigatePortal("hub")}
            title="Gateway Hub (/)"
          >
            <LayoutGrid size={15} />
            <span>Portal Gateway</span>
          </button>
          <button
            className={`g-nav-btn hospital ${currentPortal === "hospital" ? "active" : ""}`}
            onClick={() => handleNavigatePortal("hospital")}
            title="Hospital Admin Portal (/hospital)"
          >
            <Building2 size={15} />
            <span>Hospital Admin</span>
            <span className="port-tag">5173</span>
          </button>
          <button
            className={`g-nav-btn doctor ${currentPortal === "doctor" ? "active" : ""}`}
            onClick={() => handleNavigatePortal("doctor")}
            title="Doctor Portal (/doctor)"
          >
            <Stethoscope size={15} />
            <span>Doctor</span>
            <span className="port-tag">5174</span>
          </button>
          <button
            className={`g-nav-btn patient ${currentPortal === "patient" ? "active" : ""}`}
            onClick={() => handleNavigatePortal("patient")}
            title="Patient Portal (/patient)"
          >
            <User size={15} />
            <span>Patient / User</span>
            <span className="port-tag">5175</span>
          </button>
        </div>
      </nav>

      {/* Dynamic Portal View */}
      <div className="portal-page-view">
        {currentPortal === "hub" && (
          <PortalHub onNavigate={handleNavigatePortal} />
        )}

        {currentPortal === "hospital" && (
          <HospitalPortal
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            loading={loading}
            backendOnline={backendOnline}
            onRefresh={() => loadAllData(false)}
            showToast={showToast}
            onBackToHub={() => handleNavigatePortal("hub")}
          />
        )}

        {currentPortal === "doctor" && (
          <DoctorPortal
            onBackToHub={() => handleNavigatePortal("hub")}
            showToast={showToast}
          />
        )}

        {currentPortal === "patient" && (
          <PatientPortal
            onBackToHub={() => handleNavigatePortal("hub")}
            showToast={showToast}
          />
        )}
      </div>

      {/* Floating AI Health Assistant Trigger */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99 }}>
        <SpecularButton
          size="md"
          radius={24}
          tint="#06b6d4"
          tintOpacity={0.25}
          textColor="#ffffff"
          lineColor="#67e8f9"
          baseColor="#0891b2"
          intensity={1.2}
          glow={1.2}
          onClick={() => setIsAiModalOpen(true)}
          title="Open Smart Patient Assistant"
        >
          <Bot size={18} />
          <span>Ask AI Assistant</span>
          <Sparkles size={14} />
        </SpecularButton>
      </div>

      {/* AI Assistant Dialog Component */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}

export default App;
