import React from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarCheck,
  Search,
  Activity,
  HeartPulse,
} from "lucide-react";

export function Sidebar({ activeTab, setActiveTab, counts, backendOnline }) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      count: counts.doctors,
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      count: counts.patients,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: CalendarCheck,
      count: counts.appointments,
    },
    {
      id: "lookup",
      label: "ID Lookup",
      icon: Search,
      count: null,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <HeartPulse size={26} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h2>DocTime</h2>
          <span>Hospital Care System</span>
        </div>
      </div>

      <div className="menu-group">
        <p className="menu-title">CLINICAL MODULES</p>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-button ${isActive ? "selected" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">
                  <Icon size={19} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.count !== null && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="server-status">
          <span
            className={`status-indicator ${
              backendOnline ? "online" : "offline"
            }`}
          />
          <div>
            <p className="server-label">
              {backendOnline ? "Spring Boot (1080)" : "Backend Offline"}
            </p>
            <p className="server-sub">
              {backendOnline ? "Ready & Connected" : "Check Port 1080"}
            </p>
          </div>
        </div>
        <div className="system-tag">DocTime v2.0</div>
      </div>
    </aside>
  );
}

export default Sidebar;
