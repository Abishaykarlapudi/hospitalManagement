import React, { useState, useEffect, useCallback } from "react";
import PortalHub from "./components/PortalHub";
import HospitalPortal from "./components/HospitalPortal";
import DoctorPortal from "./components/DoctorPortal";
import PatientPortal from "./components/PatientPortal";
import Toast from "./components/Toast";
import AiAssistantModal from "./components/AiAssistantModal";
import UnifiedAuthModal from "./components/UnifiedAuthModal";
import authService from "./services/authService";
import doctorService from "./services/doctorService";
import patientService from "./services/patientService";
import appointmentService from "./services/appointmentService";
import { Building2, Stethoscope, User, LayoutGrid, Bot, Sparkles, ShieldCheck, KeyRound, LogIn, UserPlus } from "lucide-react";
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

  // Unified Single Auth Modal State (All Roles & Brevo Verification)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalRole, setAuthModalRole] = useState("PATIENT");
  const [activeSession, setActiveSession] = useState(() => authService.getActiveSession());

  // Show Toast Helper
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // Universal Logout Handler
  const handleLogout = useCallback(() => {
    authService.logoutAll();
    setActiveSession(null);
    showToast("info", "Signed out successfully.");
    handleNavigatePortal("hub");
  }, [showToast]);

  // Open Unified Auth Modal with targeted role and mode
  const handleOpenAuthModal = useCallback((role = "PATIENT", mode = "login") => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
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

      {/* Floating Global Portal Switcher (Quick Nav) - Completely Hidden After Login */}
      {!activeSession && (
        <nav className="global-portal-bar">
          <div className="global-brand" onClick={() => handleNavigatePortal("hub")}>
            <span className="dot active"></span>
            <strong>DocTime</strong>
            <small>AI-Powered Healthcare</small>
          </div>

          <div className="global-nav-links">
            <div className="global-auth-buttons">
              <button
                className="g-nav-btn login-btn"
                onClick={() => handleOpenAuthModal("PATIENT", "login")}
                title="Sign In to DocTime"
              >
                <LogIn size={15} color="#38bdf8" />
                <span>Login</span>
              </button>
              <button
                className="g-nav-btn signup-btn"
                onClick={() => handleOpenAuthModal("PATIENT", "register")}
                title="Create a New Account"
              >
                <UserPlus size={15} color="#34d399" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Dynamic Portal View */}
      <div className="portal-page-view">
        {currentPortal === "hub" && (
          <PortalHub
            onNavigate={handleNavigatePortal}
            onOpenAuthModal={handleOpenAuthModal}
            activeSession={activeSession}
          />
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
            activeSession={activeSession}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
          />
        )}

        {currentPortal === "doctor" && (
          <DoctorPortal
            onBackToHub={() => handleNavigatePortal("hub")}
            showToast={showToast}
            activeSession={activeSession}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
          />
        )}

        {currentPortal === "patient" && (
          <PatientPortal
            doctors={doctors}
            appointments={appointments}
            onRefresh={() => loadAllData(false)}
            showToast={showToast}
            onBackToHub={() => handleNavigatePortal("hub")}
            activeSession={activeSession}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
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

      {/* Unified Single Authentication & Brevo Verification Modal */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onClose={() => setIsAuthModalOpen(false)}
        showToast={showToast}
        onSuccess={(session) => {
          setActiveSession(session);
          setIsAuthModalOpen(false);
          let targetPortal = "hub";
          if (session.redirectPortal) {
            targetPortal = session.redirectPortal.replace("/", "");
          } else if (session.role) {
            const r = session.role.toLowerCase();
            targetPortal = r === "hospital" || r === "admin" ? "hospital" : r;
          } else if (authModalRole) {
            targetPortal = authModalRole.toLowerCase();
          }
          handleNavigatePortal(targetPortal);
        }}
      />

      {/* AI Assistant Dialog Component */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}

export default App;
