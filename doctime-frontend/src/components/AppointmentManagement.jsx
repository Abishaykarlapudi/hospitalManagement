import React, { useState, useMemo } from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  X,
  Stethoscope,
  Users,
  CheckCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import appointmentService from "../services/appointmentService";

const STATUS_OPTIONS = ["BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"];

export function AppointmentManagement({
  appointments,
  doctors,
  patients,
  onRefresh,
  showToast,
  isAddModalOpen,
  setIsAddModalOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleType, setRescheduleType] = useState("date"); // "date" or "time"
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick lookup maps
  const doctorMap = useMemo(() => {
    return doctors.reduce((acc, d) => {
      acc[d.doc_id] = d;
      return acc;
    }, {});
  }, [doctors]);

  const patientMap = useMemo(() => {
    return patients.reduce((acc, p) => {
      acc[p.pa_id] = p;
      return acc;
    }, {});
  }, [patients]);

  // Form state
  const [form, setForm] = useState({
    doc_id: "",
    pa_id: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "10:00",
    stautes: "BOOKED",
  });

  const [useCustomDocId, setUseCustomDocId] = useState(false);
  const [useCustomPatientId, setUseCustomPatientId] = useState(false);

  const formatAppDate = (dateVal) => {
    if (!dateVal) return "";
    return String(dateVal).split("T")[0];
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const doc = doctorMap[app.doc_id];
      const patient = patientMap[app.pa_id];
      const appDate = formatAppDate(app.appointment_date);

      const matchSearch =
        String(app.app_id || "").includes(searchTerm) ||
        String(app.doc_id || "").includes(searchTerm) ||
        String(app.pa_id || "").includes(searchTerm) ||
        (doc?.doc_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc?.doc_specialization || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient?.pa_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.stautes || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (app.stautes || "").toUpperCase() === statusFilter.toUpperCase();

      const matchDate =
        !dateFilter || appDate === dateFilter;

      return matchSearch && matchStatus && matchDate;
    });
  }, [appointments, doctorMap, patientMap, searchTerm, statusFilter, dateFilter]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingAppointment(null);
    setForm({
      doc_id: doctors.length > 0 ? String(doctors[0].doc_id) : "",
      pa_id: patients.length > 0 ? String(patients[0].pa_id) : "",
      appointment_date: new Date().toISOString().split("T")[0],
      appointment_time: "10:00",
      stautes: "BOOKED",
    });
    setUseCustomDocId(doctors.length === 0);
    setUseCustomPatientId(patients.length === 0);
    setIsAddModalOpen(true);
  };

  // Open Edit modal (PUT)
  const handleOpenEdit = (app) => {
    setEditingAppointment(app);
    setForm({
      doc_id: String(app.doc_id || ""),
      pa_id: String(app.pa_id || ""),
      appointment_date: formatAppDate(app.appointment_date),
      appointment_time: app.appointment_time ? app.appointment_time.slice(0, 5) : "10:00",
      stautes: app.stautes || "BOOKED",
    });
    setUseCustomDocId(true);
    setUseCustomPatientId(true);
    setIsAddModalOpen(true);
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit appointment create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doc_id || !form.pa_id || !form.appointment_date || !form.appointment_time) {
      showToast("error", "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingAppointment) {
        // Backend PUT /appointment/updatedetails/{id}
        await appointmentService.updateDetails(editingAppointment.app_id, form);
        showToast("success", `Appointment #${editingAppointment.app_id} updated.`);
      } else {
        // Backend POST /appointment/create
        await appointmentService.create(form);
        showToast("success", "Appointment booked successfully.");
      }

      setIsAddModalOpen(false);
      setEditingAppointment(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to schedule appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete appointment
  const handleDelete = async (app) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel and delete appointment #${app.app_id}?`
      )
    ) {
      return;
    }

    try {
      await appointmentService.delete(app.app_id);
      showToast("success", `Appointment #${app.app_id} deleted successfully.`);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to delete appointment.");
    }
  };

  // Open Reschedule Modal (PATCH)
  const handleOpenReschedule = (app, type = "date") => {
    setRescheduleAppointment(app);
    setRescheduleType(type);
    if (type === "date") {
      setRescheduleValue(formatAppDate(app.appointment_date));
    } else {
      setRescheduleValue(app.appointment_time ? app.appointment_time.slice(0, 5) : "10:00");
    }
  };

  // Submit Reschedule (PATCH)
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleAppointment) return;
    setSubmitting(true);

    try {
      if (rescheduleType === "date") {
        await appointmentService.updateDate(rescheduleAppointment.app_id, rescheduleValue);
        showToast(
          "success",
          `Appointment #${rescheduleAppointment.app_id} date changed to ${rescheduleValue}`
        );
      } else {
        await appointmentService.updateTime(rescheduleAppointment.app_id, rescheduleValue);
        showToast(
          "success",
          `Appointment #${rescheduleAppointment.app_id} time changed to ${rescheduleValue}`
        );
      }

      setRescheduleAppointment(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to reschedule appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      showToast("info", "No appointments to export.");
      return;
    }

    const headers = [
      "Appointment ID",
      "Doctor ID",
      "Doctor Name",
      "Patient ID",
      "Patient Name",
      "Date",
      "Time",
      "Status",
    ];

    const rows = appointments.map((a) => {
      const doc = doctorMap[a.doc_id];
      const patient = patientMap[a.pa_id];
      return [
        a.app_id,
        a.doc_id,
        `"${doc ? doc.doc_name : ""}"`,
        a.pa_id,
        `"${patient ? patient.pa_name : ""}"`,
        `"${a.appointment_date}"`,
        `"${a.appointment_time}"`,
        `"${a.stautes}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `doctime_appointments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Appointments exported to CSV.");
  };

  return (
    <div className="section-container">
      {/* Top Controls Toolbar */}
      <div className="toolbar-card">
        <div className="toolbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search appointments by ID, Doctor, Patient, Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <div className="filter-select-wrap">
            <Filter size={15} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({appointments.length})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <Calendar size={15} className="filter-icon" />
            <input
              type="date"
              className="date-filter-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by appointment date"
            />
            {dateFilter && (
              <button
                className="clear-date-btn"
                onClick={() => setDateFilter("")}
                title="Clear date filter"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button className="btn outline" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>

          <button className="btn primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Schedule Appointment
          </button>
        </div>
      </div>

      {/* Appointment Count Bar */}
      <div className="meta-bar">
        <span>
          Showing <strong>{filteredAppointments.length}</strong> of{" "}
          <strong>{appointments.length}</strong> scheduled appointments
        </span>
        {(statusFilter !== "ALL" || dateFilter) && (
          <div className="active-filters">
            {statusFilter !== "ALL" && (
              <span className="active-filter-tag">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("ALL")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {dateFilter && (
              <span className="active-filter-tag">
                Date: {dateFilter}
                <button onClick={() => setDateFilter("")}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Appointments Table */}
      <div className="data-card">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={48} opacity={0.3} />
            <h3>No appointments scheduled</h3>
            <p>
              {searchTerm || statusFilter !== "ALL" || dateFilter
                ? "No matching appointments found. Try adjusting your search query or filters."
                : "No consultations on the schedule yet. Book a new appointment for a patient!"}
            </p>
            <button className="btn primary" onClick={handleOpenAdd}>
              <Plus size={16} /> Schedule First Appointment
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>App ID</th>
                  <th>Patient</th>
                  <th>Assigned Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => {
                  const doc = doctorMap[app.doc_id];
                  const patient = patientMap[app.pa_id];
                  const status = app.stautes || "BOOKED";

                  return (
                    <tr key={app.app_id}>
                      <td>
                        <span className="id-badge">#{app.app_id}</span>
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar-circle patient">
                            {patient?.pa_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <strong>
                              {patient ? patient.pa_name : `Patient ID #${app.pa_id}`}
                            </strong>
                            <small className="entity-sub">
                              {patient ? `Age: ${patient.pa_age} | Phone: ${patient.pa_phone_number}` : `ID: #${app.pa_id}`}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar-circle doctor">
                            {doc?.doc_name?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div>
                            <strong>
                              {doc ? `Dr. ${doc.doc_name}` : `Doctor ID #${app.doc_id}`}
                            </strong>
                            <small className="entity-sub">
                              {doc ? doc.doc_specialization : `ID: #${app.doc_id}`}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="datetime-badge">
                          <div className="dt-row">
                            <Calendar size={13} />
                            <strong>{formatAppDate(app.appointment_date)}</strong>
                          </div>
                          <div className="dt-row time">
                            <Clock size={13} />
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
                        <div className="action-button-group">
                          <button
                            className="action-btn edit"
                            title="Edit Date/Time Details (PUT)"
                            onClick={() => handleOpenEdit(app)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-btn patch"
                            title="Quick Reschedule Date (PATCH)"
                            onClick={() => handleOpenReschedule(app, "date")}
                          >
                            <Calendar size={15} />
                          </button>
                          <button
                            className="action-btn patch"
                            title="Quick Reschedule Time (PATCH)"
                            onClick={() => handleOpenReschedule(app, "time")}
                          >
                            <Clock size={15} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Cancel / Delete Appointment"
                            onClick={() => handleDelete(app)}
                          >
                            <Trash2 size={15} />
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

      {/* Modal: Schedule / Edit Appointment */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  {editingAppointment ? "Update Appointment Details" : "Schedule New Appointment"}
                </h2>
                <p>
                  {editingAppointment
                    ? `Update timing for Appointment #${editingAppointment.app_id} (PUT /appointment/updatedetails/{id})`
                    : "Create a consultation entry in the DocTime database (POST /appointment/create)"}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Doctor Selection */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label>
                      Select Doctor <span className="req">*</span>
                    </label>
                    {doctors.length > 0 && (
                      <button
                        type="button"
                        className="toggle-text-btn"
                        onClick={() => setUseCustomDocId(!useCustomDocId)}
                      >
                        {useCustomDocId ? "Select from list" : "Enter Doctor ID manually"}
                      </button>
                    )}
                  </div>

                  {useCustomDocId || doctors.length === 0 ? (
                    <input
                      type="number"
                      name="doc_id"
                      min="1"
                      required
                      placeholder="Enter Doctor ID (e.g. 1)"
                      value={form.doc_id}
                      onChange={handleChange}
                    />
                  ) : (
                    <select
                      name="doc_id"
                      required
                      value={form.doc_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose a doctor --</option>
                      {doctors.map((d) => (
                        <option key={d.doc_id} value={d.doc_id}>
                          Dr. {d.doc_name} — {d.doc_specialization} (ID: #{d.doc_id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Patient Selection */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label>
                      Select Patient <span className="req">*</span>
                    </label>
                    {patients.length > 0 && (
                      <button
                        type="button"
                        className="toggle-text-btn"
                        onClick={() => setUseCustomPatientId(!useCustomPatientId)}
                      >
                        {useCustomPatientId ? "Select from list" : "Enter Patient ID manually"}
                      </button>
                    )}
                  </div>

                  {useCustomPatientId || patients.length === 0 ? (
                    <input
                      type="number"
                      name="pa_id"
                      min="1"
                      required
                      placeholder="Enter Patient ID (e.g. 1)"
                      value={form.pa_id}
                      onChange={handleChange}
                    />
                  ) : (
                    <select
                      name="pa_id"
                      required
                      value={form.pa_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose a patient --</option>
                      {patients.map((p) => (
                        <option key={p.pa_id} value={p.pa_id}>
                          {p.pa_name} — Age {p.pa_age} (ID: #{p.pa_id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date and Time Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Appointment Date <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      required
                      value={form.appointment_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Appointment Time <span className="req">*</span>
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      required
                      value={form.appointment_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div className="form-group">
                  <label>
                    Status (Entity field: <code>stautes</code>) <span className="req">*</span>
                  </label>
                  <select
                    name="stautes"
                    required
                    value={form.stautes}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-info-box">
                  <CalendarCheck size={16} />
                  <span>
                    Backend uses <code>doc_id</code>, <code>pa_id</code>, <code>appointment_date</code>, <code>appointment_time</code>, and <code>stautes</code>.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingAppointment
                    ? "Update Appointment"
                    : "Schedule Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Reschedule (PATCH Date or Time) */}
      {rescheduleAppointment && (
        <div
          className="modal-backdrop"
          onClick={() => setRescheduleAppointment(null)}
        >
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Quick Reschedule (PATCH)</h2>
                <p>
                  Appointment #{rescheduleAppointment.app_id} (
                  {rescheduleType === "date"
                    ? "PATCH /appointment/updatedate"
                    : "PATCH /appointment/updattime"}
                  )
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setRescheduleAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Update Mode</label>
                  <select
                    value={rescheduleType}
                    onChange={(e) => {
                      const t = e.target.value;
                      setRescheduleType(t);
                      if (t === "date") {
                        setRescheduleValue(rescheduleAppointment.appointment_date || "");
                      } else {
                        setRescheduleValue(
                          rescheduleAppointment.appointment_time
                            ? rescheduleAppointment.appointment_time.slice(0, 5)
                            : "10:00"
                        );
                      }
                    }}
                  >
                    <option value="date">Change Date (/appointment/updatedate)</option>
                    <option value="time">Change Time (/appointment/updattime)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    New {rescheduleType === "date" ? "Appointment Date" : "Appointment Time"}
                  </label>
                  <input
                    type={rescheduleType === "date" ? "date" : "time"}
                    required
                    value={rescheduleValue}
                    onChange={(e) => setRescheduleValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setRescheduleAppointment(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={submitting}
                >
                  {submitting ? "Rescheduling..." : "Save New Timing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentManagement;
