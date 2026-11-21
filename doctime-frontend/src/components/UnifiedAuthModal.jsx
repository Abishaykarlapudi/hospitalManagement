import React, { useState } from "react";
import {
  Building2,
  Stethoscope,
  User,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  KeyRound,
  Send,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  X,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import authService from "../services/authService";
import SpecularButton from "./SpecularButton";

export function UnifiedAuthModal({ isOpen, onClose, onSuccess, initialRole = "PATIENT", initialMode = "login", showToast }) {
  const [authMode, setAuthMode] = useState(initialMode); // "login", "register", or "verify-otp"
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"

  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode || "login");
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification view state
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyRole, setVerifyRole] = useState("PATIENT");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [devOtpBadge, setDevOtpBadge] = useState("");

  // Register form state
  const [regRole, setRegRole] = useState(initialRole.toUpperCase());
  const [regForm, setRegForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    specialization: "General Medicine",
    age: 28,
    gender: "Female",
    bloodGroup: "O+",
    address: "Hyderabad, Telangana",
    city: "Hyderabad",
    state: "Telangana",
    hospName: "DocTime Super Specialty Clinic",
  });

  if (!isOpen) return null;

  // Handle Brevo OTP dispatch (from Login with OTP screen)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      showToast("error", "Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(email.trim(), regRole);
      setOtpSent(true);
      showToast("success", `Verification code dispatched to ${email} via Brevo.`);
      if (res.devOtp) {
        showToast("info", `[Brevo Code]: ${res.devOtp}`);
        setOtpCode(res.devOtp);
      }
    } catch (err) {
      showToast("error", err.message || "Could not dispatch verification email.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP in the verify-otp screen
  const handleResendVerificationOtp = async () => {
    if (!verifyEmail) return;
    setLoading(true);
    try {
      const res = await authService.sendOtp(verifyEmail, verifyRole);
      showToast("success", `A fresh 6-digit OTP has been sent to ${verifyEmail} via Brevo.`);
      if (res.devOtp) {
        setDevOtpBadge(res.devOtp);
        showToast("info", `[Brevo Code]: ${res.devOtp}`);
      }
    } catch (err) {
      showToast("error", err.message || "Failed to resend verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Unified Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("error", "Email is required.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (loginMethod === "otp") {
        if (!otpCode.trim()) {
          showToast("error", "Please enter the 6-digit verification code.");
          setLoading(false);
          return;
        }
        res = await authService.verifyOtp(email.trim(), otpCode.trim());
      } else {
        if (!password.trim()) {
          showToast("error", "Please enter your password.");
          setLoading(false);
          return;
        }
        res = await authService.unifiedLogin(email.trim(), password.trim());
      }

      showToast("success", `Welcome back, ${res.user?.fullname || res.user?.fullName || "User"} (${res.role})!`);
      if (onSuccess) onSuccess(res);
      if (onClose) onClose();
    } catch (err) {
      showToast("error", err.message || "Invalid credentials or verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Unified Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.email.trim() || !regForm.fullname.trim()) {
      showToast("error", "Full name and email are mandatory.");
      return;
    }
    if (!regForm.password.trim()) {
      showToast("error", "Please provide a password for your account.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...regForm,
        role: regRole,
      };
      const res = await authService.unifiedRegister(payload);
      showToast("success", `Registration submitted! Brevo verification code sent to ${regForm.email}`);

      // Set up verify-otp view
      setVerifyEmail(regForm.email.trim());
      setVerifyRole(regRole);
      setVerificationOtp(res.devOtp || "");
      setDevOtpBadge(res.devOtp || "");
      setAuthMode("verify-otp");

      if (res.devOtp) {
        showToast("info", `[Brevo Verification OTP]: ${res.devOtp}`);
      }
    } catch (err) {
      showToast("error", err.message || "Registration could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification Submission (Final step of Registration)
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!verificationOtp.trim()) {
      showToast("error", "Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp(verifyEmail.trim(), verificationOtp.trim());
      showToast("success", `Account verified and authenticated! Welcome, ${res.user?.fullname || res.user?.fullName || "User"}!`);
      if (onSuccess) onSuccess(res);
      if (onClose) onClose();
    } catch (err) {
      showToast("error", err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fast One-Click Demo Role Selectors
  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoginMethod("password");
    setLoading(true);
    try {
      const res = await authService.unifiedLogin(demoEmail, demoPassword);
      showToast("success", `Signed in as ${res.user?.fullname || demoEmail} (${res.role})`);
      if (onSuccess) onSuccess(res);
      if (onClose) onClose();
    } catch (err) {
      showToast("error", err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal-backdrop" onClick={onClose}>
      <div
        className="auth-card title-card title-shape-card"
        style={{
          maxWidth: authMode === "register" ? 560 : 490,
          margin: "auto",
          position: "relative",
          padding: "36px 36px",
          background: "#0d1527",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Top Header */}
        <div className="auth-card-top" style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            className="auth-avatar"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.25))",
              border: "1px solid rgba(56,189,248,0.5)",
              color: "#38bdf8",
              width: 58,
              height: 58,
              borderRadius: 16,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
            }}
          >
            {authMode === "verify-otp" ? <Mail size={30} color="#34d399" /> : <ShieldCheck size={30} />}
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
            {authMode === "verify-otp"
              ? "Verify Your Email Address"
              : authMode === "register"
              ? "Create Your DocTime Account"
              : "DocTime Unified Access"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>
            {authMode === "verify-otp"
              ? `A 6-digit Brevo verification code was dispatched to ${verifyEmail}`
              : "Single secure login for Patients, Physicians, and Hospital Administrators"}
          </p>
        </div>

        {/* Auth Mode Toggle (Only show if not in OTP verification step) */}
        {authMode !== "verify-otp" && (
          <div
            className="auth-tab-switch"
            style={{
              display: "flex",
              gap: 6,
              background: "rgba(15, 23, 42, 0.75)",
              padding: 4,
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20,
            }}
          >
            <button
              className={`auth-switch-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => setAuthMode("login")}
              type="button"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 9,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: authMode === "login" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: authMode === "login" ? "#ffffff" : "#94a3b8",
                transition: "all 0.2s ease",
              }}
            >
              Sign In (All Roles)
            </button>
            <button
              className={`auth-switch-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => setAuthMode("register")}
              type="button"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 9,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: authMode === "register" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                color: authMode === "register" ? "#34d399" : "#94a3b8",
                transition: "all 0.2s ease",
              }}
            >
              Register New Account
            </button>
          </div>
        )}

        {/* ==================== 1. UNIFIED LOGIN FORM ==================== */}
        {authMode === "login" && (
          <div>
            {/* Login Method Sub-Toggle: Password vs Brevo Email OTP */}
            <div
              style={{
                display: "flex",
                gap: 8,
                background: "rgba(11, 17, 32, 0.7)",
                padding: 4,
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: 18,
              }}
            >
              <button
                type="button"
                onClick={() => setLoginMethod("password")}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: loginMethod === "password" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: loginMethod === "password" ? "#ffffff" : "#94a3b8",
                }}
              >
                Password Sign In
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("otp")}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: loginMethod === "otp" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                  color: loginMethod === "otp" ? "#34d399" : "#94a3b8",
                }}
              >
                <Mail size={14} />
                <span>Brevo Email OTP</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. doctor@hospital.com or patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              {loginMethod === "password" ? (
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password (e.g. admin123 or password)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "rgba(15, 23, 42, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 13.5,
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ margin: 0, color: "#cbd5e1", fontSize: 12.5, fontWeight: 600 }}>
                      6-Digit Brevo Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || !email.trim()}
                      style={{
                        background: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {otpSent ? "Resend Code" : "Send Code via Brevo"}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{
                      width: "100%",
                      letterSpacing: "8px",
                      fontSize: 20,
                      fontWeight: 800,
                      textAlign: "center",
                      padding: "11px 14px",
                      background: "rgba(15, 23, 42, 0.85)",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      borderRadius: 10,
                      color: "#38bdf8",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <SpecularButton
                size="lg"
                radius={12}
                tint="#06b6d4"
                tintOpacity={0.25}
                textColor="#ffffff"
                lineColor="#38bdf8"
                baseColor="#0891b2"
                style={{ width: "100%", marginTop: 4 }}
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                <span>{loading ? "Authenticating Session..." : "Sign In & Enter Portal"}</span>
                <ArrowRight size={16} />
              </SpecularButton>
            </form>

            {/* Quick Demo One-Click Sign In */}
            <div className="auth-quick-select" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Zap size={14} color="#f59e0b" />
                <h4 style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  One-Click Demo Profiles (Auto-Role Redirection):
                </h4>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  className="quick-doc-item"
                  onClick={() => handleQuickDemoLogin("admin@doctime.com", "admin123")}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Building2 size={16} color="#38bdf8" />
                  <div>
                    <strong style={{ fontSize: 11.5, color: "#ffffff", display: "block" }}>Hospital Admin</strong>
                    <small style={{ fontSize: 10, color: "#94a3b8" }}>admin@doctime.com</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="quick-doc-item"
                  onClick={() => handleQuickDemoLogin("nagaraju@gamil.com", "password")}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(52, 211, 153, 0.25)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Stethoscope size={16} color="#34d399" />
                  <div>
                    <strong style={{ fontSize: 11.5, color: "#ffffff", display: "block" }}>Dr. nagaraju</strong>
                    <small style={{ fontSize: 10, color: "#94a3b8" }}>Cardiology</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="quick-doc-item"
                  onClick={() => handleQuickDemoLogin("kabishay1@gmail.com", "password")}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.25)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <User size={16} color="#fb923c" />
                  <div>
                    <strong style={{ fontSize: 11.5, color: "#ffffff", display: "block" }}>abishay (Patient)</strong>
                    <small style={{ fontSize: 10, color: "#94a3b8" }}>Age 22 • ID #1</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="quick-doc-item"
                  onClick={() => handleQuickDemoLogin("sita.sharma@example.com", "password123")}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(192, 132, 252, 0.25)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <User size={16} color="#c084fc" />
                  <div>
                    <strong style={{ fontSize: 11.5, color: "#ffffff", display: "block" }}>Sita Sharma</strong>
                    <small style={{ fontSize: 10, color: "#94a3b8" }}>Age 27 • B+</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. UNIFIED REGISTRATION FORM ==================== */}
        {authMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                Select Your Healthcare Role
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { role: "PATIENT", label: "Patient", icon: User, color: "#fb923c" },
                  { role: "DOCTOR", label: "Doctor", icon: Stethoscope, color: "#34d399" },
                  { role: "HOSPITAL", label: "Hospital", icon: Building2, color: "#38bdf8" },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = regRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRegRole(item.role)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        border: active ? `2px solid ${item.color}` : "1px solid rgba(255, 255, 255, 0.1)",
                        background: active ? "rgba(255, 255, 255, 0.12)" : "rgba(11, 17, 32, 0.6)",
                        color: active ? "#ffffff" : "#94a3b8",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: active ? `0 0 16px ${item.color}40` : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon size={18} color={item.color} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder={regRole === "DOCTOR" ? "e.g. Dr. Priya Sharma" : "e.g. Rahul Varma"}
                value={regForm.fullname}
                onChange={(e) => setRegForm({ ...regForm, fullname: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: 8,
                  color: "#ffffff",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div className="form-group">
                <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 8,
                    color: "#ffffff",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 8,
                    color: "#ffffff",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {regRole === "DOCTOR" && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Medical Specialization
                </label>
                <select
                  value={regForm.specialization}
                  onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })}
                  style={{
                    background: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: "9px 12px",
                    width: "100%",
                    fontSize: 13,
                  }}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
            )}

            {regRole === "PATIENT" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div className="form-group">
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "rgba(15, 23, 42, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: 8,
                      color: "#ffffff",
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Blood Group
                  </label>
                  <select
                    value={regForm.bloodGroup}
                    onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                    style={{
                      background: "rgba(15, 23, 42, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffffff",
                      borderRadius: 8,
                      padding: "9px 12px",
                      width: "100%",
                      fontSize: 13,
                    }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            )}

            {regRole === "HOSPITAL" && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  placeholder="DocTime Care Hospital"
                  value={regForm.hospName}
                  onChange={(e) => setRegForm({ ...regForm, hospName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 8,
                    color: "#ffffff",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Password (Required for future Email & Password logins)
              </label>
              <input
                type="password"
                placeholder="Choose a secure password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: 8,
                  color: "#ffffff",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <SpecularButton
              size="lg"
              radius={12}
              tint="#10b981"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#34d399"
              baseColor="#059669"
              style={{ width: "100%", marginTop: 4 }}
              onClick={handleRegisterSubmit}
              disabled={loading}
            >
              <span>{loading ? "Registering & Dispatching OTP..." : "Register & Send Brevo OTP"}</span>
              <Send size={16} />
            </SpecularButton>
          </form>
        )}

        {/* ==================== 3. BREVO OTP VERIFICATION SCREEN ==================== */}
        {authMode === "verify-otp" && (
          <form onSubmit={handleVerifyOtpSubmit} className="auth-form">
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.35)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                Brevo Email Verification Pending
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 12.5 }}>
                We sent a 6-digit verification code to <strong style={{ color: "#ffffff" }}>{verifyEmail}</strong>.
              </div>
            </div>

            {/* Quick-fill Badge if devOtp was provided */}
            {devOtpBadge && (
              <div
                style={{
                  background: "rgba(6, 182, 212, 0.12)",
                  border: "1px dashed rgba(56, 189, 248, 0.5)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                    Received Code:
                  </span>
                  <strong style={{ fontSize: 18, color: "#38bdf8", letterSpacing: "3px" }}>
                    {devOtpBadge}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setVerificationOtp(devOtpBadge)}
                  style={{
                    background: "rgba(56, 189, 248, 0.2)",
                    border: "1px solid rgba(56, 189, 248, 0.5)",
                    color: "#38bdf8",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Insert Code
                </button>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: 12.5, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={verificationOtp}
                onChange={(e) => setVerificationOtp(e.target.value)}
                style={{
                  width: "100%",
                  letterSpacing: "10px",
                  fontSize: 24,
                  fontWeight: 800,
                  textAlign: "center",
                  padding: "12px 14px",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "2px solid rgba(52, 211, 153, 0.5)",
                  borderRadius: 12,
                  color: "#34d399",
                  boxSizing: "border-box",
                }}
                autoFocus
                required
              />
            </div>

            <SpecularButton
              size="lg"
              radius={12}
              tint="#10b981"
              tintOpacity={0.3}
              textColor="#ffffff"
              lineColor="#34d399"
              baseColor="#059669"
              style={{ width: "100%", marginBottom: 12 }}
              onClick={handleVerifyOtpSubmit}
              disabled={loading}
            >
              <span>{loading ? "Verifying OTP & Logging In..." : "Verify Code & Complete Registration"}</span>
              <CheckCircle2 size={16} />
            </SpecularButton>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleResendVerificationOtp}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={12} />
                <span>Resend Code via Brevo</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UnifiedAuthModal;