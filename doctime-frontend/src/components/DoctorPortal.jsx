import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import authService from "../services/authService";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import patientService from "../services/patientService";

export function DoctorPortal({
  onBackToHub,
  showToast,
  activeSession,
  onOpenAuthModal,
  onLogout,
}) {
  const [currentDoctor, setCurrentDoctor] = useState(() => {
    if (activeSession && (activeSession.doctor || activeSession.role === "DOCTOR")) {
      return activeSession.doctor || activeSession.user;
    }
    return authService.getDoctorUser();
  });

  // Synchronize with parent activeSession
  useEffect(() => {
    if (activeSession && (activeSession.doctor || activeSession.role === "DOCTOR")) {
      setCurrentDoctor(activeSession.doctor || activeSession.user);
    } else if (!activeSession) {
      setCurrentDoctor(null);
    }
  }, [activeSession]);

  const [emailInput, setEmailInput] = useState("");
  const [registeredDoctors, setRegisteredDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loadingApps, setLoadingApps] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reschedule modal
  const [rescheduleApp, setRescheduleApp] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Load all registered doctors for quick-select login
  useEffect(() => {
    if (!currentDoctor) {
      setLoadingDocs(true);
      doctorService
        .getAll()
        .then((docs) => setRegisteredDoctors(Array.isArray(docs) ? docs : []))
        .catch(() => {})
        .finally(() => setLoadingDocs(false));
    }
  }, [currentDoctor]);

  // Load appointments for this logged-in doctor
  const loadDoctorAppointments = useCallback(async () => {
    if (!currentDoctor?.doc_id) return;
    setLoadingApps(true);
    try {
      const [apps, patientsList] = await Promise.all([
        appointmentService.getByDoctorId(currentDoctor.doc_id).catch(() => []),
        patientService.getAll().catch(() => []),
      ]);

      setAppointments(Array.isArray(apps) ? apps : []);

      const pMap = {};
      if (Array.isArray(patientsList)) {
        patientsList.forEach((p) => {
          pMap[p.pa_id] = p;
        });
      }
      setPatientsMap(pMap);
    } catch (err) {
      showToast("error", "Failed to load doctor appointments: " + err.message);
    } finally {
      setLoadingApps(false);
    }
  }, [currentDoctor, showToast]);

  useEffect(() => {
    if (currentDoctor) {
      loadDoctorAppointments();
    }
  }, [currentDoctor, loadDoctorAppointments]);

  // Handle Login
  const handleLogin = async (e, directEmail = null) => {
    if (e) e.preventDefault();
    const targetEmail = directEmail || emailInput;
    if (!targetEmail.trim()) {
      showToast("error", "Please enter your doctor email address.");
      return;
    }

    setLoggingIn(true);
    try {
      const res = await authService.doctorLogin(targetEmail.trim());
      const doctorObj = res.doctor || res.user || res;
      setCurrentDoctor(doctorObj);
      const displayName = doctorObj?.doc_name || doctorObj?.fullname || "Doctor";
      showToast("success", `Welcome back, Dr. ${displayName}!`);
    } catch (err) {
      showToast("error", err.message || "Failed to log in as doctor.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.doctorLogout();
      setCurrentDoctor(null);
      setAppointments([]);
      showToast("info", "Doctor signed out.");
    }
  };

  // Status Update (Confirm, Complete, Cancel)
  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await appointmentService.updateStatus(appId, newStatus);
      showToast("success", `Appointment #${appId} marked as ${newStatus}.`);
      loadDoctorAppointments();
    } catch (err) {
      showToast("error", err.message || "Failed to update appointment status.");
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (app) => {
    setRescheduleApp(app);
    setNewDate(app.appointment_date ? String(app.appointment_date).split("T")[0] : "");
    setNewTime(app.appointment_time ? app.appointment_time.slice(0, 5) : "10:00");
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleApp) return;
    setSubmittingReschedule(true);
    try {
      await appointmentService.updateDetails(rescheduleApp.app_id, {
        appointment_date: newDate,
        appointment_time: newTime,
      });
      showToast("success", `Appointment #${rescheduleApp.app_id} rescheduled.`);
      setRescheduleApp(null);
      loadDoctorAppointments();
    } catch (err) {
      showToast("error", err.message || "Failed to reschedule.");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const patient = patientsMap[app.pa_id];
      const pName = patient?.pa_name || "";
      const status = app.status || app.stautes || "BOOKED";

      const matchesSearch =
        String(app.app_id).includes(searchTerm) ||
        pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [appointments, patientsMap, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    let booked = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;

    appointments.forEach((a) => {
      const st = (a.status || a.stautes || "BOOKED").toUpperCase();
      if (st === "BOOKED") booked++;
      else if (st === "CONFIRMED") confirmed++;
      else if (st === "COMPLETED") completed++;
      else if (st === "CANCELLED") cancelled++;
    });

    return { total, booked, confirmed, completed, cancelled };
  }, [appointments]);

  // ==================== 1. UNIFIED SINGLE DOCTOR GATEWAY ====================
  if (!currentDoctor) {
    return (
      <div className="portal-auth-container">
        <div className="auth-header-bar">
          <button className="auth-back-btn" onClick={onBackToHub}>
            <ArrowLeft size={18} />
            <span>Back to Portal Gateway</span>
          </button>
          <div className="portal-tag-pill doctor">Direct Link: /doctor • Port 5174</div>
        </div>

        <div className="auth-card doctor-card title-card" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div className="auth-card-top" style={{ marginBottom: 20 }}>
            <div className="auth-avatar doctor" style={{ margin: "0 auto 14px auto" }}>
              <Stethoscope size={36} color="#059669" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>DocTime Clinical Portal</h2>
            <p style={{ color: "#94a3b8", fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>
              Single secure access with Brevo OTP email verification. Review clinical schedule and patient consultation queue.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "24px 0" }}>
            <SpecularButton
              size="lg"
              radius={12}
              tint="#10b981"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#34d399"
              baseColor="#059669"
              style={{ width: "100%" }}
              onClick={() => onOpenAuthModal ? onOpenAuthModal("DOCTOR", "login") : handleLogin(null, "nagaraju@gamil.com")}
            >
              <span>Single Sign In (All Roles)</span>
              <ArrowRight size={16} />
            </SpecularButton>

            <SpecularButton
              size="lg"
              radius={12}
              tint="#06b6d4"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#38bdf8"
              baseColor="#0891b2"
              style={{ width: "100%" }}
              onClick={() => onOpenAuthModal ? onOpenAuthModal("DOCTOR", "register") : null}
            >
              <span>Register New Physician (Brevo OTP)</span>
              <ShieldCheck size={16} />
            </SpecularButton>
          </div>

          {/* Quick Doctor Selector */}
          <div className="auth-quick-select" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, textAlign: "left" }}>
            <h4 style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px 0" }}>Fast One-Click Demo Physicians:</h4>
            {loadingDocs ? (
              <div className="quick-loading">Loading doctors roster...</div>
            ) : registeredDoctors.length === 0 ? (
              <div className="quick-empty">No doctors in database. Add via Hospital Portal.</div>
            ) : (
              <div className="quick-doc-list">
                {registeredDoctors.slice(0, 3).map((doc) => (
                  <button
                    key={doc.doc_id}
                    className="quick-doc-item"
                    onClick={() => handleLogin(null, doc.doc_email)}
                  >
                    <div className="q-avatar">{doc.doc_name?.charAt(0)}</div>
                    <div className="q-info">
                      <strong>Dr. {doc.doc_name}</strong>
                      <small>{doc.doc_specialization} • {doc.doc_email}</small>
                    </div>
                    <ChevronRight size={16} color="#059669" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. DOCTOR DASHBOARD ====================
  return (
    <div className="doctor-dashboard-layout">
      {/* Top Navigation */}
      <header className="doctor-header">
        <div className="doc-brand">
          <div className="doc-brand-icon">
            <Stethoscope size={24} color="#ffffff" />
          </div>
          <div>
            <h3>DocTime Clinical Portal</h3>
            <span className="doc-link-indicator">Direct Link: /doctor</span>
          </div>
        </div>

        <div className="doc-profile-pill">
          <div className="doc-avatar-large">
            {(currentDoctor?.doc_name || currentDoctor?.fullname || "D").charAt(0)?.toUpperCase()}
          </div>
          <div className="doc-text">
            <strong>Dr. {currentDoctor?.doc_name || currentDoctor?.fullname || "Doctor"}</strong>
            <span>{(currentDoctor?.doc_specialization || currentDoctor?.specialization || "Physician")} • ID #{currentDoctor?.doc_id || currentDoctor?.doctorId || 1}</span>
          </div>
          <button className="doc-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="doctor-main-content">
        {/* Welcome & Stats Row */}
        <div className="doctor-welcome-card">
          <div className="doc-welcome-text">
            <h2>Welcome back, Dr. {currentDoctor?.doc_name || currentDoctor?.fullname || "Doctor"}</h2>
            <p>
              Specialization: <strong>{currentDoctor?.doc_specialization || currentDoctor?.specialization || "General Medicine"}</strong> | Contact:{" "}
              <strong>{currentDoctor?.doc_email || currentDoctor?.email}</strong> | Tel:{" "}
              <strong>{currentDoctor?.doc_phone_number || currentDoctor?.phone}</strong>
            </p>
          </div>
          <div className="doc-actions-right">
            <button className="doc-refresh-btn" onClick={loadDoctorAppointments} disabled={loadingApps}>
              <RefreshCw size={16} className={loadingApps ? "spin" : ""} />
              <span>Refresh Schedule</span>
            </button>
            <button className="doc-hub-btn" onClick={onBackToHub}>
              <span>Portal Hub</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="doctor-stats-grid">
          <div className="doc-stat-card total">
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="doc-stat-card booked">
            <div className="stat-num">{stats.booked}</div>
            <div className="stat-label">Pending / Booked</div>
          </div>
          <div className="doc-stat-card confirmed">
            <div className="stat-num">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="doc-stat-card completed">
            <div className="stat-num">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="doc-table-card">
          <div className="doc-table-toolbar">
            <div className="doc-search-box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search appointments by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="doc-filter-group">
              <Filter size={16} color="#64748b" />
              <span>Status:</span>
              {["ALL", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  className={`doc-filter-btn ${statusFilter === st ? "active" : ""}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments Table */}
          {loadingApps ? (
            <div className="doc-empty-state">
              <RefreshCw size={32} className="spin" color="#059669" />
              <p>Loading your schedule from DocTime API...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="doc-empty-state">
              <Calendar size={48} color="#cbd5e1" />
              <h3>No Appointments Found</h3>
              <p>
                {searchTerm || statusFilter !== "ALL"
                  ? "No appointments match your active filter criteria."
                  : "You currently have no patient appointments scheduled."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Patient Details</th>
                    <th>Consultation Date & Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => {
                    const patient = patientsMap[app.pa_id];
                    const status = (app.status || app.stautes || "BOOKED").toUpperCase();
                    const appDate = String(app.appointment_date || "").split("T")[0];

                    return (
                      <tr key={app.app_id}>
                        <td>
                          <span className="id-badge">#{app.app_id}</span>
                        </td>
                        <td>
                          <div className="entity-cell">
                            <div className="avatar-circle patient">
                              {patient?.pa_name?.charAt(0) || "P"}
                            </div>
                            <div>
                              <strong>{patient ? patient.pa_name : `Patient ID #${app.pa_id}`}</strong>
                              <small className="entity-sub">
                                {patient
                                  ? `Age: ${patient.pa_age} | Tel: ${patient.pa_phone_number} | ${patient.pa_email}`
                                  : `Patient #${app.pa_id}`}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="datetime-badge">
                            <div className="dt-row">
                              <Calendar size={14} color="#059669" />
                              <strong>{appDate}</strong>
                            </div>
                            <div className="dt-row time">
                              <Clock size={14} />
                              <span>{app.appointment_time || "--"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="action-button-group doc-action-bar">
                            {status === "BOOKED" && (
                              <button
                                className="action-btn-custom confirm"
                                title="Confirm Appointment"
                                onClick={() => handleStatusUpdate(app.app_id, "CONFIRMED")}
                              >
                                <Check size={14} /> Confirm
                              </button>
                            )}
                            {status !== "COMPLETED" && (
                              <button
                                className="action-btn-custom complete"
                                title="Mark as Completed"
                                onClick={() => handleStatusUpdate(app.app_id, "COMPLETED")}
                              >
                                <CheckCircle size={14} /> Complete
                              </button>
                            )}
                            {status !== "CANCELLED" && (
                              <button
                                className="action-btn-custom cancel"
                                title="Cancel Consultation"
                                onClick={() => handleStatusUpdate(app.app_id, "CANCELLED")}
                              >
                                <X size={14} /> Cancel
                              </button>
                            )}
                            <button
                              className="action-btn-custom reschedule"
                              title="Reschedule Date/Time"
                              onClick={() => openRescheduleModal(app)}
                            >
                              <Clock size={14} /> Reschedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleApp && (
        <div className="modal-backdrop" onClick={() => setRescheduleApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reschedule Appointment #{rescheduleApp.app_id}</h3>
              <button className="modal-close-btn" onClick={() => setRescheduleApp(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="modal-form">
              <div className="form-group">
                <label>New Consultation Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Consultation Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setRescheduleApp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary doctor" disabled={submittingReschedule}>
                  {submittingReschedule ? "Updating..." : "Save Rescheduled Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPortal;
