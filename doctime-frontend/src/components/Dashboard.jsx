import React from "react";
import {
  Stethoscope,
  Users,
  CalendarCheck,
  Clock,
  PlusCircle,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Database,
  Search,
} from "lucide-react";

export function Dashboard({
  doctors,
  patients,
  appointments,
  setActiveTab,
  onOpenDoctorModal,
  onOpenPatientModal,
  onOpenAppointmentModal,
}) {
  const bookedCount = appointments.filter(
    (a) => a.stautes?.toUpperCase() === "BOOKED" || a.stautes?.toUpperCase() === "CONFIRMED"
  ).length;

  const completedCount = appointments.filter(
    (a) => a.stautes?.toUpperCase() === "COMPLETED"
  ).length;

  // Compute specializations summary
  const specMap = doctors.reduce((acc, doc) => {
    const spec = doc.doc_specialization || "General Medicine";
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {});

  // Resolve Doctor & Patient names for recent appointments
  const doctorMap = doctors.reduce((acc, d) => {
    acc[d.doc_id] = d;
    return acc;
  }, {});

  const patientMap = patients.reduce((acc, p) => {
    acc[p.pa_id] = p;
    return acc;
  }, {});

  const recentAppointments = [...appointments].reverse().slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome to DocTime Central Clinic</h2>
          <p>
            Connected to Spring Boot REST API. Complete hospital management for
            physicians, patients, and clinical appointment bookings.
          </p>
          <div className="welcome-actions">
            <button
              className="banner-btn primary"
              onClick={onOpenAppointmentModal}
            >
              <CalendarCheck size={16} /> Schedule Appointment
            </button>
            <button
              className="banner-btn secondary"
              onClick={onOpenDoctorModal}
            >
              <PlusCircle size={16} /> Register Doctor
            </button>
            <button
              className="banner-btn secondary"
              onClick={onOpenPatientModal}
            >
              <Users size={16} /> Add Patient
            </button>
          </div>
        </div>
        <div className="welcome-decoration">
          <Stethoscope size={90} opacity={0.2} />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div
          className="metric-card clickable"
          onClick={() => setActiveTab("doctors")}
        >
          <div className="metric-header">
            <span className="metric-title">Medical Staff</span>
            <div className="metric-icon-wrap teal">
              <Stethoscope size={22} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{doctors.length}</h3>
            <span className="metric-badge positive">Verified Doctors</span>
          </div>
          <div className="metric-footer">
            <span>Manage Doctors Directory</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => setActiveTab("patients")}
        >
          <div className="metric-header">
            <span className="metric-title">Registered Patients</span>
            <div className="metric-icon-wrap blue">
              <Users size={22} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{patients.length}</h3>
            <span className="metric-badge positive">Patient Profiles</span>
          </div>
          <div className="metric-footer">
            <span>View Patient Records</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => setActiveTab("appointments")}
        >
          <div className="metric-header">
            <span className="metric-title">Total Appointments</span>
            <div className="metric-icon-wrap amber">
              <CalendarCheck size={22} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{appointments.length}</h3>
            <span className="metric-badge neutral">
              {bookedCount} Active / Booked
            </span>
          </div>
          <div className="metric-footer">
            <span>Review Appointment Roster</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Consultation Status</span>
            <div className="metric-icon-wrap emerald">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{completedCount}</h3>
            <span className="metric-badge success">Completed Visits</span>
          </div>
          <div className="metric-footer">
            <span>{appointments.length - completedCount} In Progress / Open</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Appointments & Specialization Distribution */}
      <div className="dashboard-grid-2">
        {/* Recent Appointments */}
        <div className="dashboard-card recent-appointments-card">
          <div className="card-header">
            <div>
              <h3>Recent Appointments</h3>
              <p>Latest scheduled consultations</p>
            </div>
            <button
              className="text-link"
              onClick={() => setActiveTab("appointments")}
            >
              View all ({appointments.length}) <ArrowRight size={14} />
            </button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="empty-state-mini">
              <CalendarCheck size={36} opacity={0.3} />
              <p>No appointments booked yet.</p>
              <button
                className="btn-sm primary"
                onClick={onOpenAppointmentModal}
              >
                Book First Appointment
              </button>
            </div>
          ) : (
            <div className="mini-table-wrap">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((app) => {
                    const doc = doctorMap[app.doc_id];
                    const patient = patientMap[app.pa_id];
                    const status = app.stautes || "BOOKED";

                    return (
                      <tr key={app.app_id}>
                        <td>
                          <span className="id-badge">#{app.app_id}</span>
                        </td>
                        <td>
                          <strong>{patient ? patient.pa_name : `Patient #${app.pa_id}`}</strong>
                        </td>
                        <td>
                          <span>{doc ? `Dr. ${doc.doc_name}` : `Doctor #${app.doc_id}`}</span>
                        </td>
                        <td>
                          <div className="datetime-cell">
                            <span>{app.appointment_date ? app.appointment_date.split("T")[0] : "--"}</span>
                            <small>{app.appointment_time || "--"}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Doctor Specializations & Quick Info */}
        <div className="dashboard-card specializations-card">
          <div className="card-header">
            <div>
              <h3>Medical Departments</h3>
              <p>Specialization coverage</p>
            </div>
            <button
              className="text-link"
              onClick={() => setActiveTab("doctors")}
            >
              Manage <ArrowRight size={14} />
            </button>
          </div>

          {Object.keys(specMap).length === 0 ? (
            <div className="empty-state-mini">
              <Stethoscope size={36} opacity={0.3} />
              <p>No doctors registered yet.</p>
              <button className="btn-sm primary" onClick={onOpenDoctorModal}>
                Register Doctor
              </button>
            </div>
          ) : (
            <div className="specializations-list">
              {Object.entries(specMap).map(([spec, count]) => (
                <div key={spec} className="spec-item">
                  <div className="spec-info">
                    <span className="spec-name">{spec}</span>
                    <span className="spec-count">
                      {count} {count === 1 ? "Physician" : "Physicians"}
                    </span>
                  </div>
                  <div className="spec-bar-bg">
                    <div
                      className="spec-bar-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / Math.max(doctors.length, 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="backend-callout">
            <Database size={20} className="callout-icon" />
            <div className="callout-content">
              <strong>Spring Boot Backend Active</strong>
              <p>
                All data synchronizes directly with the MySQL database on port 1080
                across Doctors, Patients, and Appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
