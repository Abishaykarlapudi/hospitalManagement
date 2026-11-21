import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  Calendar,
  Clock,
  Stethoscope,
  Plus,
  LogOut,
  RefreshCw,
  ArrowLeft,
  X,
  AlertCircle,
  Search,
  CheckCircle,
  CalendarCheck,
  ChevronRight,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import authService from "../services/authService";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import patientService from "../services/patientService";
import MedicalReportsManager from "./MedicalReportsManager";
import AnimatedList from "./AnimatedList";
import SpecularButton from "./SpecularButton";

export function PatientPortal({ onBackToHub, showToast }) {
  const [currentPatient, setCurrentPatient] = useState(() => authService.getPatientUser());
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Register form state
  const [regForm, setRegForm] = useState({
    pa_name: "",
    pa_age: "",
    pa_phone_number: "",
    pa_email: "",
  });
  const [registering, setRegistering] = useState(false);

  // Quick select patients
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Dashboard state
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [doctorsMap, setDoctorsMap] = useState({});

  // Book appointment modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [bookDate, setBookDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookTime, setBookTime] = useState("10:00");
  const [booking, setBooking] = useState(false);

  // Active tab in patient dashboard
  const [patientTab, setPatientTab] = useState("my-appointments"); // "my-appointments" or "find-doctors"
  const [doctorSearch, setDoctorSearch] = useState("");

  // Load patients roster for quick-select if not logged in
  useEffect(() => {
    if (!currentPatient) {
      setLoadingPatients(true);
      patientService
        .getAll()
        .then((pts) => setRegisteredPatients(Array.isArray(pts) ? pts : []))
        .catch(() => {})
        .finally(() => setLoadingPatients(false));
    }
  }, [currentPatient]);

  // Load doctors and appointments for current patient
  const loadPatientData = useCallback(async () => {
    if (!currentPatient?.pa_id) return;
    setLoadingApps(true);
    try {
      const [apps, docsList] = await Promise.all([
        appointmentService.getByPatientId(currentPatient.pa_id).catch(() => []),
        doctorService.getAll().catch(() => []),
      ]);

      setAppointments(Array.isArray(apps) ? apps : []);
      setDoctors(Array.isArray(docsList) ? docsList : []);

      const dMap = {};
      if (Array.isArray(docsList)) {
        docsList.forEach((d) => {
          dMap[d.doc_id] = d;
        });
      }
      setDoctorsMap(dMap);
    } catch (err) {
      showToast("error", "Failed to load patient records: " + err.message);
    } finally {
      setLoadingApps(false);
    }
  }, [currentPatient, showToast]);

  useEffect(() => {
    if (currentPatient) {
      loadPatientData();
    }
  }, [currentPatient, loadPatientData]);

  // Handle Login
  const handleLogin = async (e, directEmail = null) => {
    if (e) e.preventDefault();
    const targetEmail = directEmail || emailInput;
    if (!targetEmail.trim()) {
      showToast("error", "Please enter your registered patient email address.");
      return;
    }

    setLoggingIn(true);
    try {
      const res = await authService.patientLogin(targetEmail.trim());
      setCurrentPatient(res.patient);
      showToast("success", `Welcome back, ${res.patient.pa_name}!`);
    } catch (err) {
      showToast("error", err.message || "Failed to log in as patient.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.pa_name.trim() || !regForm.pa_email.trim() || !regForm.pa_phone_number) {
      showToast("error", "Please fill in all registration fields.");
      return;
    }

    setRegistering(true);
    try {
      const res = await authService.patientRegister(regForm);
      setCurrentPatient(res.patient);
      showToast("success", `Registration successful! Welcome to DocTime, ${res.patient.pa_name}.`);
    } catch (err) {
      showToast("error", err.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    authService.patientLogout();
    setCurrentPatient(null);
    setAppointments([]);
    showToast("info", "Signed out of Patient Portal.");
  };

  // Open Book Modal (optionally preselecting doctor)
  const openBookModal = (preselectedDoctorId = null) => {
    if (preselectedDoctorId) {
      setSelectedDocId(String(preselectedDoctorId));
    } else if (doctors.length > 0) {
      setSelectedDocId(String(doctors[0].doc_id));
    }
    setBookDate(new Date().toISOString().split("T")[0]);
    setBookTime("10:00");
    setIsBookModalOpen(true);
  };

  // Submit Booking
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDocId || !bookDate || !bookTime) {
      showToast("error", "Please choose a doctor, appointment date, and time slot.");
      return;
    }

    setBooking(true);
    try {
      await appointmentService.create({
        doc_id: Number(selectedDocId),
        pa_id: currentPatient.pa_id,
        appointment_date: bookDate,
        appointment_time: bookTime,
        status: "BOOKED",
      });

      showToast("success", "Appointment successfully booked!");
      setIsBookModalOpen(false);
      setPatientTab("my-appointments");
      loadPatientData();
    } catch (err) {
      showToast("error", err.message || "Failed to schedule appointment.");
    } finally {
      setBooking(false);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (appId) => {
    if (!window.confirm(`Are you sure you want to cancel appointment #${appId}?`)) {
      return;
    }

    try {
      await appointmentService.updateStatus(appId, "CANCELLED");
      showToast("success", `Appointment #${appId} was cancelled.`);
      loadPatientData();
    } catch (err) {
      showToast("error", err.message || "Failed to cancel appointment.");
    }
  };

  // Filtered doctors for directory
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      return (
        d.doc_name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.doc_specialization.toLowerCase().includes(doctorSearch.toLowerCase())
      );
    });
  }, [doctors, doctorSearch]);

  // ==================== 1. LOGIN / REGISTER SCREEN ====================
  if (!currentPatient) {
    return (
      <div className="portal-auth-container">
        <div className="auth-header-bar">
          <button className="auth-back-btn" onClick={onBackToHub}>
            <ArrowLeft size={18} />
            <span>Back to Portal Gateway</span>
          </button>
          <div className="portal-tag-pill patient">Direct Link: /patient • Port 5175</div>
        </div>

        <div className="auth-card patient-card title-card">
          <div className="auth-card-top">
            <div className="auth-avatar patient">
              <User size={36} color="#ea580c" />
            </div>
            <h2>Patient / User Portal</h2>
            <p>Book doctor appointments, view booking status, and consult healthcare specialists.</p>
          </div>

          {/* Toggle Login vs Register */}
          <div className="auth-tab-switch">
            <button
              className={`auth-switch-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => setAuthMode("login")}
            >
              Sign In (Existing Patient)
            </button>
            <button
              className={`auth-switch-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => setAuthMode("register")}
            >
              Register (New Patient)
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Registered Patient Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., patient@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn patient" disabled={loggingIn}>
                {loggingIn ? "Verifying..." : "Sign In to Patient Portal"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={regForm.pa_name}
                  onChange={(e) => setRegForm({ ...regForm, pa_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="e.g., 28"
                    value={regForm.pa_age}
                    onChange={(e) => setRegForm({ ...regForm, pa_age: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., 9876543210"
                    value={regForm.pa_phone_number}
                    onChange={(e) => setRegForm({ ...regForm, pa_phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={regForm.pa_email}
                  onChange={(e) => setRegForm({ ...regForm, pa_email: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn patient" disabled={registering}>
                {registering ? "Registering Patient..." : "Create Patient Account & Sign In"}
              </button>
            </form>
          )}

          {/* Quick Select demo patients */}
          {authMode === "login" && (
            <div className="auth-quick-select">
              <h4>Or Select an Existing Patient:</h4>
              {loadingPatients ? (
                <div className="quick-loading">Loading patients...</div>
              ) : registeredPatients.length === 0 ? (
                <div className="quick-empty">No patients yet. Use Register tab above!</div>
              ) : (
                <div className="quick-doc-list">
                  {registeredPatients.map((p) => (
                    <button
                      key={p.pa_id}
                      className="quick-doc-item"
                      onClick={() => handleLogin(null, p.pa_email)}
                    >
                      <div className="q-avatar patient">{p.pa_name?.charAt(0)}</div>
                      <div className="q-info">
                        <strong>{p.pa_name}</strong>
                        <small>Age: {p.pa_age} • {p.pa_email}</small>
                      </div>
                      <ChevronRight size={16} color="#ea580c" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== 2. PATIENT DASHBOARD ====================
  return (
    <div className="patient-dashboard-layout">
      {/* Top Header */}
      <header className="patient-header">
        <div className="patient-brand">
          <div className="patient-brand-icon">
            <User size={24} color="#ffffff" />
          </div>
          <div>
            <h3>DocTime Patient Portal</h3>
            <span className="patient-link-indicator">Direct Link: /patient</span>
          </div>
        </div>

        <div className="patient-profile-pill">
          <div className="patient-avatar-large">
            {currentPatient.pa_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="patient-text">
            <strong>{currentPatient.pa_name}</strong>
            <span>Age: {currentPatient.pa_age} • ID #{currentPatient.pa_id}</span>
          </div>
          <button className="patient-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="patient-main-content">
        {/* Welcome Card & Action */}
        <div className="patient-welcome-card">
          <div className="patient-welcome-text">
            <h2>Hello, {currentPatient.pa_name}!</h2>
            <p>
              Email: <strong>{currentPatient.pa_email}</strong> | Contact:{" "}
              <strong>{currentPatient.pa_phone_number}</strong> | Age:{" "}
              <strong>{currentPatient.pa_age} years</strong>
            </p>
          </div>
          <div className="patient-actions-right">
            <SpecularButton
              size="md"
              radius={12}
              tint="#06b6d4"
              tintOpacity={0.2}
              textColor="#ffffff"
              lineColor="#38bdf8"
              baseColor="#0891b2"
              onClick={() => openBookModal()}
            >
              <Plus size={16} />
              <span>Book New Appointment</span>
            </SpecularButton>
            <SpecularButton
              size="md"
              radius={12}
              tint="#ffffff"
              tintOpacity={0.06}
              textColor="#cbd5e1"
              lineColor="#ffffff"
              baseColor="#334155"
              onClick={onBackToHub}
            >
              <span>Portal Hub</span>
            </SpecularButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="patient-nav-tabs">
          <button
            className={`patient-nav-tab ${patientTab === "my-appointments" ? "active" : ""}`}
            onClick={() => setPatientTab("my-appointments")}
          >
            <CalendarCheck size={18} />
            <span>My Scheduled Appointments ({appointments.length})</span>
          </button>
          <button
            className={`patient-nav-tab ${patientTab === "find-doctors" ? "active" : ""}`}
            onClick={() => setPatientTab("find-doctors")}
          >
            <Stethoscope size={18} />
            <span>Find & Consult Doctors ({doctors.length})</span>
          </button>
          <button
            className={`patient-nav-tab ${patientTab === "reports" ? "active" : ""}`}
            onClick={() => setPatientTab("reports")}
          >
            <FileText size={18} />
            <span>Medical Reports & AI Summaries</span>
          </button>
        </div>

        {/* Content Area */}
        {patientTab === "reports" ? (
          <MedicalReportsManager
            patientId={currentPatient?.pa_id}
            patientName={currentPatient?.pa_name}
            showToast={showToast}
          />
        ) : patientTab === "my-appointments" ? (
          <div className="patient-table-card">
            <div className="patient-card-header">
              <h3>Your Consultation History</h3>
              <button
                className="patient-refresh-btn"
                onClick={loadPatientData}
                disabled={loadingApps}
              >
                <RefreshCw size={15} className={loadingApps ? "spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingApps ? (
              <div className="doc-empty-state">
                <RefreshCw size={32} className="spin" color="#ea580c" />
                <p>Loading your appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="doc-empty-state">
                <Calendar size={48} color="#cbd5e1" />
                <h3>No Appointments Yet</h3>
                <p>You have not booked any appointments yet. Click below to schedule a visit!</p>
                <button className="patient-book-now-btn" onClick={() => openBookModal()}>
                  <Plus size={16} /> Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Attending Doctor</th>
                      <th>Scheduled Date & Time</th>
                      <th>Booking Status</th>
                      <th style={{ textAlign: "right" }}>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => {
                      const doc = doctorsMap[app.doc_id];
                      const status = (app.status || app.stautes || "BOOKED").toUpperCase();
                      const appDate = String(app.appointment_date || "").split("T")[0];

                      return (
                        <tr key={app.app_id}>
                          <td>
                            <span className="id-badge">#{app.app_id}</span>
                          </td>
                          <td>
                            <div className="entity-cell">
                              <div className="avatar-circle doctor">
                                {doc?.doc_name?.charAt(0) || "D"}
                              </div>
                              <div>
                                <strong>{doc ? `Dr. ${doc.doc_name}` : `Doctor #${app.doc_id}`}</strong>
                                <small className="entity-sub">
                                  {doc ? `${doc.doc_specialization} • ${doc.doc_email}` : `ID: #${app.doc_id}`}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="datetime-badge">
                              <div className="dt-row">
                                <Calendar size={14} color="#ea580c" />
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
                              {status !== "CANCELLED" && status !== "COMPLETED" && (
                                <button
                                  className="action-btn-custom cancel"
                                  onClick={() => handleCancelAppointment(app.app_id)}
                                >
                                  Cancel Booking
                                </button>
                              )}
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
        ) : (
          /* Find Doctors Directory */
          <div className="patient-doctors-section">
            <div className="doc-search-box full">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search doctors by name, cardiology, pediatrics, general medicine..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
            </div>

            <div className="patient-doctors-grid">
              {filteredDoctors.map((doc) => (
                <div key={doc.doc_id} className="patient-doc-card">
                  <div className="p-doc-top">
                    <div className="p-doc-avatar">{doc.doc_name?.charAt(0)}</div>
                    <div>
                      <h4>Dr. {doc.doc_name}</h4>
                      <span className="p-doc-spec">{doc.doc_specialization}</span>
                    </div>
                  </div>
                  <div className="p-doc-contact">
                    <div className="p-contact-item">
                      <Mail size={14} color="#64748b" />
                      <span>{doc.doc_email}</span>
                    </div>
                    <div className="p-contact-item">
                      <Phone size={14} color="#64748b" />
                      <span>{doc.doc_phone_number}</span>
                    </div>
                  </div>
                  <button
                    className="p-book-doc-btn"
                    onClick={() => openBookModal(doc.doc_id)}
                  >
                    <CalendarCheck size={16} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBookModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Doctor Appointment</h3>
              <button className="modal-close-btn" onClick={() => setIsBookModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="modal-form">
              <div className="form-group">
                <label>Select Doctor</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.doc_id} value={d.doc_id}>
                      Dr. {d.doc_name} — {d.doc_specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  value={bookDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preferred Time Slot</label>
                <input
                  type="time"
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary patient" disabled={booking}>
                  {booking ? "Confirming..." : "Confirm & Book Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPortal;
