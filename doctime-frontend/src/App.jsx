import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DoctorManagement from "./components/DoctorManagement";
import PatientManagement from "./components/PatientManagement";
import AppointmentManagement from "./components/AppointmentManagement";
import QuickLookup from "./components/QuickLookup";
import Toast from "./components/Toast";
import doctorService from "./services/doctorService";
import patientService from "./services/patientService";
import appointmentService from "./services/appointmentService";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal triggers from dashboard or shortcuts
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Show Toast Helper
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // Fetch all data from Spring Boot REST API
  const loadAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [docsRes, patientsRes, appsRes] = await Promise.all([
        doctorService.getAll().catch((err) => {
          console.error("Failed to load doctors:", err);
          return [];
        }),
        patientService.getAll().catch((err) => {
          console.error("Failed to load patients:", err);
          return [];
        }),
        appointmentService.getAll().catch((err) => {
          console.error("Failed to load appointments:", err);
          return [];
        }),
      ]);

      setDoctors(Array.isArray(docsRes) ? docsRes : []);
      setPatients(Array.isArray(patientsRes) ? patientsRes : []);
      setAppointments(Array.isArray(appsRes) ? appsRes : []);
      setBackendOnline(true);

      if (!silent) {
        showToast("success", "Synchronized hospital records from server.");
      }
    } catch (err) {
      setBackendOnline(false);
      showToast(
        "error",
        "Could not connect to Spring Boot API on port 1080. Please ensure the backend is running."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  // Handlers to open modals with tab switch
  const handleOpenDoctorFromDashboard = () => {
    setActiveTab("doctors");
    setIsDoctorModalOpen(true);
  };

  const handleOpenPatientFromDashboard = () => {
    setActiveTab("patients");
    setIsPatientModalOpen(true);
  };

  const handleOpenAppointmentFromDashboard = () => {
    setActiveTab("appointments");
    setIsAppointmentModalOpen(true);
  };

  const counts = {
    doctors: doctors.length,
    patients: patients.length,
    appointments: appointments.length,
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          onRefresh={() => loadAllData(false)}
          loading={loading}
          counts={counts}
        />

        <main className="content-area">
          {activeTab === "dashboard" && (
            <Dashboard
              doctors={doctors}
              patients={patients}
              appointments={appointments}
              setActiveTab={setActiveTab}
              onOpenDoctorModal={handleOpenDoctorFromDashboard}
              onOpenPatientModal={handleOpenPatientFromDashboard}
              onOpenAppointmentModal={handleOpenAppointmentFromDashboard}
            />
          )}

          {activeTab === "doctors" && (
            <DoctorManagement
              doctors={doctors}
              appointments={appointments}
              onRefresh={() => loadAllData(true)}
              showToast={showToast}
              isAddModalOpen={isDoctorModalOpen}
              setIsAddModalOpen={setIsDoctorModalOpen}
            />
          )}

          {activeTab === "patients" && (
            <PatientManagement
              patients={patients}
              appointments={appointments}
              onRefresh={() => loadAllData(true)}
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
              onRefresh={() => loadAllData(true)}
              showToast={showToast}
              isAddModalOpen={isAppointmentModalOpen}
              setIsAddModalOpen={setIsAppointmentModalOpen}
            />
          )}

          {activeTab === "lookup" && (
            <QuickLookup showToast={showToast} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
