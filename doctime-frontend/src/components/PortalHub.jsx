import React from "react";
import { Building2, Stethoscope, User, ArrowRight, ShieldCheck, Calendar, Clock, Activity, Sparkles } from "lucide-react";
import TiltedCard, { TiltedCardLayer } from "./TiltedCard";
import SpecularButton from "./SpecularButton";
import "./PortalTiltedCard.css";

export function PortalHub({ onNavigate }) {
  const portals = [
    {
      id: "hospital",
      title: "Hospital Admin Portal",
      subtitle: "For Hospital Administrators & Operations",
      description: "Manage hospital doctors, patient records, master schedules, analytics, and hospital-wide configurations.",
      icon: Building2,
      badge: "Administration",
      badgeColor: "#38bdf8",
      bgColor: "rgba(37, 99, 235, 0.2)",
      accentColor: "#2563eb",
      link: "/hospital",
      port: "Port 5173",
      loginNote: "admin@doctime.com / admin123",
    },
    {
      id: "doctor",
      title: "Doctor Portal",
      subtitle: "For Registered Physicians & Specialists",
      description: "Access your clinical schedule, review assigned patient appointments, update consultation statuses, and reschedule slots.",
      icon: Stethoscope,
      badge: "Clinical Care",
      badgeColor: "#34d399",
      bgColor: "rgba(16, 185, 129, 0.2)",
      accentColor: "#059669",
      link: "/doctor",
      port: "Port 5174",
      loginNote: "Sign in with registered doctor email",
    },
    {
      id: "patient",
      title: "Patient / User Portal",
      subtitle: "For Patients & Care Seekers",
      description: "Find qualified doctors by specialization, book doctor appointments, track booking confirmations, and manage personal visits.",
      icon: User,
      badge: "Patient Services",
      badgeColor: "#fb923c",
      bgColor: "rgba(249, 115, 22, 0.2)",
      accentColor: "#ea580c",
      link: "/patient",
      port: "Port 5175",
      loginNote: "Sign in with email or register new patient",
    },
  ];

  return (
    <div className="portal-hub-container" style={{ position: "relative", minHeight: "100vh" }}>
      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Hero Header */}
        <div className="hub-hero">
          <div className="hub-brand">
            <div className="hub-logo-box">
              <Activity size={32} color="#06b6d4" />
            </div>
            <span className="hub-app-name">DocTime Healthcare</span>
          </div>
          <h1 className="hub-title">Unified Hospital Management Gateway</h1>
          <p className="hub-subtitle">
            Please select your authorized portal to continue. Each portal provides a dedicated login, tailored features, and role-based access.
          </p>

          <div className="hub-quick-bar">
            <div className="quick-item">
              <ShieldCheck size={18} color="#10b981" />
              <span>Role-Based Authentication</span>
            </div>
            <div className="quick-item">
              <Calendar size={18} color="#38bdf8" />
              <span>Real-Time Scheduling</span>
            </div>
            <div className="quick-item">
              <Clock size={18} color="#a78bfa" />
              <span>Multi-Port & Direct Link Routing</span>
            </div>
          </div>
        </div>

        {/* 3 Portal Cards Grid Using TiltedCard */}
        <div className="portal-grid">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div key={portal.id} className="portal-tilted-wrapper">
                <TiltedCard
                  containerHeight="440px"
                  containerWidth="100%"
                  imageHeight="440px"
                  imageWidth="100%"
                  rotateAmplitude={12}
                  scaleOnHover={1.04}
                  glare={0.45}
                  glareColor="#ffffff"
                  shadow={0.5}
                  radius={18}
                  showTooltip={false}
                  flipOnClick={false}
                  onClick={() => onNavigate(portal.id)}
                >
                  <TiltedCardLayer depth={25}>
                    <div
                      className="portal-glass-tilted-card"
                      style={{ borderTop: `4px solid ${portal.accentColor}` }}
                    >
                      <div className="portal-card-header">
                        <div
                          className="portal-icon-wrapper"
                          style={{
                            backgroundColor: portal.bgColor,
                            color: portal.accentColor,
                          }}
                        >
                          <Icon size={30} />
                        </div>
                        <div className="portal-badge-group">
                          <span
                            className="portal-badge"
                            style={{
                              backgroundColor: portal.bgColor,
                              color: portal.badgeColor,
                            }}
                          >
                            {portal.badge}
                          </span>
                          <span className="port-badge">{portal.port}</span>
                        </div>
                      </div>

                      <h2 className="portal-card-title">{portal.title}</h2>
                      <h3 className="portal-card-subtitle">{portal.subtitle}</h3>
                      <p className="portal-card-desc">{portal.description}</p>

                      <div className="portal-login-hint">
                        <strong>Login:</strong> {portal.loginNote}
                      </div>

                      <div className="portal-card-footer">
                        <SpecularButton
                          size="md"
                          radius={12}
                          tint={portal.accentColor}
                          tintOpacity={0.3}
                          textColor="#ffffff"
                          lineColor="#ffffff"
                          baseColor={portal.accentColor}
                          intensity={1.1}
                          style={{ width: "100%" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(portal.id);
                          }}
                        >
                          <span>Launch {portal.title.split(" ")[0]} Portal</span>
                          <ArrowRight size={16} />
                        </SpecularButton>
                        <div className="portal-direct-link">
                          Direct Link: <code>{portal.link}</code>
                        </div>
                      </div>
                    </div>
                  </TiltedCardLayer>
                </TiltedCard>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="hub-footer">
          <p>
            DocTime v2.0 • Spring Boot 4 REST API (Port 1080) • React 19 Frontend Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortalHub;
