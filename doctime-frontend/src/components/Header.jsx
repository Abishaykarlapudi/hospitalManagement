import React from "react";
import { RefreshCw, Stethoscope, Users, Calendar, ShieldCheck } from "lucide-react";

export function Header({
  activeTab,
  onRefresh,
  loading,
  counts,
}) {
  const titles = {
    dashboard: {
      title: "DocTime Hospital Dashboard",
      subtitle: "Overview of hospital records, patient admissions, and appointments.",
    },
    doctors: {
      title: "Doctor Management",
      subtitle: "Register, update, and manage verified physicians and medical staff.",
    },
    patients: {
      title: "Patient Management",
      subtitle: "Maintain patient profiles, contact records, and clinical logs.",
    },
    appointments: {
      title: "Appointment Management",
      subtitle: "Schedule consultations, assign doctors, and track appointment status.",
    },
    lookup: {
      title: "Direct Record Lookup",
      subtitle: "Inspect raw database records by ID using dedicated REST endpoints.",
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="topbar">
      <div className="topbar-title-section">
        <p className="eyebrow">DOC-TIME HOSPITAL SYSTEM</p>
        <h1>{current.title}</h1>
        <p className="topbar-subtitle">{current.subtitle}</p>
      </div>

      <div className="topbar-actions">
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh data from server"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          <span>{loading ? "Refreshing..." : "Sync Data"}</span>
        </button>

        <div className="admin-chip">
          <ShieldCheck size={18} className="shield-icon" />
          <div className="admin-chip-text">
            <strong>Administrator</strong>
            <small>DocTime Portal</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
