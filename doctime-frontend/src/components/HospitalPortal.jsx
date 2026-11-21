import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  UserCheck,
  Zap,
  Lock,
  Mail,
  LogOut
} from "lucide-react";
import authService from "../services/authService";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import DoctorManagement from "./DoctorManagement";
import PatientManagement from "./PatientManagement";
import AppointmentManagement from "./AppointmentManagement";
import QuickLookup from "./QuickLookup";

export function HospitalPortal({
  doctors,
  patients,
  appointments,
  loading,
  backendOnline,
  onRefresh,
  showToast,
  onBackToHub,
  activeSession,
  onOpenAuthModal,
  onLogout,
}) {
  const [hospitalUser, setHospitalUser] = useState(() => {
    if (activeSession && (activeSession.role === "HOSPITAL" || activeSession.role === "ADMIN")) {
      return activeSession.user || activeSession;
    }
    return authService.getHospitalUser();
  });

  // Synchronize with parent activeSession
  React.useEffect(() => {
    if (activeSession && (activeSession.role === "HOSPITAL" || activeSession.role === "ADMIN")) {
      setHospitalUser(activeSession.user || activeSession);
    } else if (!activeSession) {
      setHospitalUser(null);
    }
  }, [activeSession]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin active sub-tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modals inside hospital portal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("error", "Please enter both hospital username and password.");
      return;
    }

    setLoggingIn(true);
    try {
      const res = await authService.hospitalLogin(username.trim(), password.trim());
      setHospitalUser(res);
      showToast("success", "Hospital Administration authenticated successfully.");
    } catch (err) {
      showToast("error", err.message || "Invalid hospital credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleFillDemo = () => {
    setUsername("admin@doctime.com");
    setPassword("admin123");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.hospitalLogout();
      setHospitalUser(null);
      showToast("info", "Hospital Administrator signed out.");
    }
  };

  // ==================== 1. UNIFIED SINGLE HOSPITAL GATEWAY ====================
  if (!hospitalUser) {
    return (
      <div className="portal-auth-container">
        <div className="auth-header-bar">
          <button className="auth-back-btn" onClick={onBackToHub}>
            <ArrowLeft size={18} />
            <span>Back to Portal Gateway</span>
          </button>
          <div className="portal-tag-pill hospital">Direct Link: /hospital • Port 5173</div>
        </div>

        <div className="auth-card hospital-card title-card" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div className="auth-card-top" style={{ marginBottom: 20 }}>
            <div className="auth-avatar hospital" style={{ margin: "0 auto 14px auto" }}>
              <Building2 size={36} color="#2563eb" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>Hospital Administration</h2>
            <p style={{ color: "#94a3b8", fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>
              Single secure access with Brevo OTP email verification. Manage verified physicians, departments, and clinical appointments.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "24px 0" }}>
            <SpecularButton
              size="lg"
              radius={12}
              tint="#2563eb"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#38bdf8"
              baseColor="#1d4ed8"
              style={{ width: "100%" }}
              onClick={() => onOpenAuthModal ? onOpenAuthModal("HOSPITAL", "login") : handleLogin(null)}
            >
              <span>Single Sign In (All Roles)</span>
              <ArrowRight size={16} />
            </SpecularButton>

            <SpecularButton
              size="lg"
              radius={12}
              tint="#10b981"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#34d399"
              baseColor="#059669"
              style={{ width: "100%" }}
              onClick={() => onOpenAuthModal ? onOpenAuthModal("HOSPITAL", "register") : null}
            >
              <span>Register New Hospital Entity (Brevo OTP)</span>
              <ShieldCheck size={16} />
            </SpecularButton>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
            <button
              type="button"
              className="demo-credentials-btn"
              onClick={async () => {
                try {
                  const res = await authService.unifiedLogin("admin@doctime.com", "admin123");
                  setHospitalUser(res.user || res);
                  showToast("success", "Signed in as Hospital Administrator");
                } catch {
                  handleFillDemo();
                }
              }}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Zap size={14} color="#38bdf8" />
              <span>One-Click Administrator Demo (admin@doctime.com)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. HOSPITAL ADMIN DASHBOARD ====================
  const counts = {
    doctors: doctors.length,
    patients: patients.length,
    appointments: appointments.length,
  };

  return (
    <div className="app-container">
      {/* Sidebar with portal info */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        backendOnline={backendOnline}
      />

      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          backendOnline={backendOnline}
          onRefresh={onRefresh}
          loading={loading}
          customRightElement={
            <div className="admin-header-actions">
              <button className="portal-switch-pill" onClick={onBackToHub} title="Switch Portal">
                <span>Switch Portal</span>
              </button>
              <button className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          }
        />

        <main className="content-area">
          {activeTab === "dashboard" && (
            <Dashboard
              doctors={doctors}
              patients={patients}
              appointments={appointments}
              onNavigate={setActiveTab}
              onOpenAddDoctor={() => {
                setActiveTab("doctors");
                setIsDoctorModalOpen(true);
              }}
              onOpenAddPatient={() => {
                setActiveTab("patients");
                setIsPatientModalOpen(true);
              }}
              onOpenAddAppointment={() => {
                setActiveTab("appointments");
                setIsAppointmentModalOpen(true);
              }}
            />
          )}

          {activeTab === "doctors" && (
            <DoctorManagement
              doctors={doctors}
              appointments={appointments}
              onRefresh={onRefresh}
              showToast={showToast}
              isAddModalOpen={isDoctorModalOpen}
              setIsAddModalOpen={setIsDoctorModalOpen}
            />
          )}

          {activeTab === "patients" && (
            <PatientManagement
              patients={patients}
              appointments={appointments}
              onRefresh={onRefresh}
              showToast={showToast}
              isAddModalOpen={isPatientModalOpen}
              setIsAddModalOpen={setIsPatientModalOpen}
            />
          )}

          {activeTab === "appointments" && (
            <AppointmentManagement
              appointments={appointments}
              doctors={doctors}
              patients={patients}
              onRefresh={onRefresh}
              showToast={showToast}
              isAddModalOpen={isAppointmentModalOpen}
              setIsAddModalOpen={setIsAppointmentModalOpen}
            />
          )}

          {activeTab === "lookup" && (
            <QuickLookup
              doctors={doctors}
              patients={patients}
              appointments={appointments}
              showToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default HospitalPortal;
