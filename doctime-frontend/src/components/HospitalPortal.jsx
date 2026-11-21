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
}) {
  const [hospitalUser, setHospitalUser] = useState(() => authService.getHospitalUser());
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
    authService.hospitalLogout();
    setHospitalUser(null);
    showToast("info", "Hospital Administrator signed out.");
  };

  // ==================== 1. HOSPITAL LOGIN SCREEN ====================
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

        <div className="auth-card hospital-card title-card">
          <div className="auth-card-top">
            <div className="auth-avatar hospital">
              <Building2 size={36} color="#2563eb" />
            </div>
            <h2>Hospital Admin Sign In</h2>
            <p>Access master hospital operations, doctors roster, patient records, and appointments.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Administrator Email or Username</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="admin@doctime.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn hospital" disabled={loggingIn}>
              {loggingIn ? "Authenticating..." : "Sign In to Hospital Portal"}
            </button>

            <button
              type="button"
              className="demo-credentials-btn"
              onClick={handleFillDemo}
            >
              <Zap size={14} color="#2563eb" />
              <span>Fill Demo Credentials (admin@doctime.com / admin123)</span>
            </button>
          </form>

          <div className="hospital-auth-notice">
            <ShieldCheck size={16} color="#10b981" />
            <span>Authorized hospital personnel only. Activity is audited.</span>
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
