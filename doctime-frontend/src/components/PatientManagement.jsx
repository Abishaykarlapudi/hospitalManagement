import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Zap,
  Eye,
  Mail,
  Phone,
  Calendar,
  X,
  UserCheck,
  HeartPulse,
} from "lucide-react";
import patientService from "../services/patientService";

export function PatientManagement({
  patients,
  appointments,
  onRefresh,
  showToast,
  isAddModalOpen,
  setIsAddModalOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [patchModalPatient, setPatchModalPatient] = useState(null);
  const [patchField, setPatchField] = useState("name");
  const [patchValue, setPatchValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    pa_name: "",
    pa_age: "",
    pa_phone_number: "",
    pa_email: "",
  });

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      return (
        (p.pa_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.pa_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.pa_phone_number || "").includes(searchTerm) ||
        String(p.pa_age || "").includes(searchTerm) ||
        String(p.pa_id || "").includes(searchTerm)
      );
    });
  }, [patients, searchTerm]);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingPatient(null);
    setForm({
      pa_name: "",
      pa_age: "",
      pa_phone_number: "",
      pa_email: "",
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setForm({
      pa_name: p.pa_name || "",
      pa_age: p.pa_age || "",
      pa_phone_number: p.pa_phone_number || "",
      pa_email: p.pa_email || "",
    });
    setIsAddModalOpen(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPatient) {
        // Call backend PUT /patient/updatedetails/{id}
        await patientService.updateDetails(editingPatient.pa_id, form);
        showToast("success", `Patient ${form.pa_name} details updated successfully.`);
      } else {
        // Call backend POST /patient/create
        await patientService.create(form);
        showToast("success", `Patient ${form.pa_name} registered successfully.`);
      }

      setIsAddModalOpen(false);
      setEditingPatient(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to save patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Patient
  const handleDelete = async (p) => {
    if (
      !window.confirm(
        `Are you sure you want to delete patient ${p.pa_name} (ID: #${p.pa_id})?`
      )
    ) {
      return;
    }

    try {
      await patientService.delete(p.pa_id);
      showToast("success", `Patient ${p.pa_name} was deleted successfully.`);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to delete patient.");
    }
  };

  // Open quick patch modal
  const handleOpenPatch = (p, field = "name") => {
    setPatchModalPatient(p);
    setPatchField(field);
    if (field === "name") setPatchValue(p.pa_name || "");
    if (field === "email") setPatchValue(p.pa_email || "");
    if (field === "phone") setPatchValue(p.pa_phone_number || "");
  };

  // Submit quick patch
  const handlePatchSubmit = async (e) => {
    e.preventDefault();
    if (!patchModalPatient) return;
    setSubmitting(true);

    try {
      if (patchField === "name") {
        await patientService.updateName(patchModalPatient.pa_id, patchValue);
        showToast("success", `Patient #${patchModalPatient.pa_id} name updated to ${patchValue}`);
      } else if (patchField === "email") {
        await patientService.updateEmail(patchModalPatient.pa_id, patchValue);
        showToast("success", `Patient #${patchModalPatient.pa_id} email updated to ${patchValue}`);
      } else if (patchField === "phone") {
        await patientService.updatePhoneNumber(patchModalPatient.pa_id, patchValue);
        showToast("success", `Patient #${patchModalPatient.pa_id} phone updated to ${patchValue}`);
      }
      setPatchModalPatient(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to update patient field.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (patients.length === 0) {
      showToast("info", "No patient records to export.");
      return;
    }

    const headers = ["ID", "Name", "Age", "Email", "Phone Number"];
    const rows = patients.map((p) => [
      p.pa_id,
      `"${p.pa_name}"`,
      p.pa_age,
      `"${p.pa_email}"`,
      `"${p.pa_phone_number}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `doctime_patients_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Patient directory exported to CSV.");
  };

  // Get appointments for a patient
  const getPatientAppointments = (paId) => {
    return appointments.filter((a) => a.pa_id === paId);
  };

  const getAgeBadge = (age) => {
    if (age < 18) return <span className="age-badge pediatric">Pediatric ({age}y)</span>;
    if (age >= 60) return <span className="age-badge senior">Senior ({age}y)</span>;
    return <span className="age-badge adult">Adult ({age}y)</span>;
  };

  return (
    <div className="section-container">
      {/* Top Controls Toolbar */}
      <div className="toolbar-card">
        <div className="toolbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search patients by name, age, phone, email, ID..."
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
          <button className="btn outline" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>

          <button className="btn primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Patient
          </button>
        </div>
      </div>

      {/* Patient Count Bar */}
      <div className="meta-bar">
        <span>
          Showing <strong>{filteredPatients.length}</strong> of{" "}
          <strong>{patients.length}</strong> registered patients
        </span>
      </div>

      {/* Main Patients Table */}
      <div className="data-card">
        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <Users size={48} opacity={0.3} />
            <h3>No patients found</h3>
            <p>
              {searchTerm
                ? "Try searching with a different name, email, or phone number."
                : "No patient records exist yet in your DocTime database. Admit your first patient!"}
            </p>
            <button className="btn primary" onClick={handleOpenAdd}>
              <Plus size={16} /> Register New Patient
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Patient Name</th>
                  <th>Age Category</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Appointments</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => {
                  const patientApps = getPatientAppointments(p.pa_id);
                  return (
                    <tr key={p.pa_id}>
                      <td>
                        <span className="id-badge">#{p.pa_id}</span>
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar-circle patient">
                            {p.pa_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <strong>{p.pa_name}</strong>
                            <small className="entity-sub">Patient #{p.pa_id}</small>
                          </div>
                        </div>
                      </td>
                      <td>{getAgeBadge(p.pa_age)}</td>
                      <td>
                        <a
                          href={`mailto:${p.pa_email}`}
                          className="contact-link"
                        >
                          <Mail size={13} /> {p.pa_email}
                        </a>
                      </td>
                      <td>
                        <span className="phone-cell">
                          <Phone size={13} /> {p.pa_phone_number}
                        </span>
                      </td>
                      <td>
                        <span className="count-pill">
                          {patientApps.length} booked
                        </span>
                      </td>
                      <td>
                        <div className="action-button-group">
                          <button
                            className="action-btn view"
                            title="View Patient Details"
                            onClick={() => setViewingPatient(p)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit Patient Details (PUT)"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-btn patch"
                            title="Quick PATCH Field"
                            onClick={() => handleOpenPatch(p, "phone")}
                          >
                            <Zap size={15} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete Patient"
                            onClick={() => handleDelete(p)}
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

      {/* Modal: Add / Edit Patient */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingPatient ? "Edit Patient Details" : "Register New Patient"}</h2>
                <p>
                  {editingPatient
                    ? `Update record for patient ${editingPatient.pa_name} (#${editingPatient.pa_id})`
                    : "Add a patient to the DocTime database (POST /patient/create)"}
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
                <div className="form-group">
                  <label>
                    Patient Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="pa_name"
                    required
                    placeholder="e.g. John Doe or Maria Garcia"
                    value={form.pa_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Age (Years) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    name="pa_age"
                    min="0"
                    max="130"
                    required
                    placeholder="e.g. 32"
                    value={form.pa_age}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      name="pa_phone_number"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.pa_phone_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      name="pa_email"
                      required
                      placeholder="e.g. patient@example.com"
                      value={form.pa_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-info-box">
                  <Users size={16} />
                  <span>
                    Backend uses <code>pa_name</code>, <code>pa_age</code>, <code>pa_phone_number</code>, and <code>pa_email</code>.
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
                    : editingPatient
                    ? "Update Patient"
                    : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Patient Details */}
      {viewingPatient && (
        <div className="modal-backdrop" onClick={() => setViewingPatient(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Patient Profile</h2>
                <p>Record ID #{viewingPatient.pa_id}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setViewingPatient(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-banner">
                <div className="avatar-circle patient large">
                  {viewingPatient.pa_name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div>
                  <h3>{viewingPatient.pa_name}</h3>
                  <div style={{ marginTop: "4px" }}>
                    {getAgeBadge(viewingPatient.pa_age)}
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Patient ID</span>
                  <span className="detail-value">#{viewingPatient.pa_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{viewingPatient.pa_age} years old</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{viewingPatient.pa_email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{viewingPatient.pa_phone_number}</span>
                </div>
              </div>

              <div className="section-sub-header">
                <h4>Appointment History ({getPatientAppointments(viewingPatient.pa_id).length})</h4>
              </div>

              {getPatientAppointments(viewingPatient.pa_id).length === 0 ? (
                <p className="empty-note">No appointments scheduled for this patient yet.</p>
              ) : (
                <div className="mini-appointment-list">
                  {getPatientAppointments(viewingPatient.pa_id).map((a) => (
                    <div key={a.app_id} className="mini-appointment-item">
                      <div>
                        <strong>App #{a.app_id}</strong>
                        <span>Doctor ID: #{a.doc_id}</span>
                      </div>
                      <div className="mini-app-right">
                        <span>
                          {(a.appointment_date ? a.appointment_date.split("T")[0] : "--")} at {a.appointment_time || "--"}
                        </span>
                        <span className={`status-pill ${a.stautes?.toLowerCase()}`}>{a.stautes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setViewingPatient(null)}
              >
                Close
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  const p = viewingPatient;
                  setViewingPatient(null);
                  handleOpenEdit(p);
                }}
              >
                <Edit2 size={14} /> Edit Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick PATCH Field */}
      {patchModalPatient && (
        <div
          className="modal-backdrop"
          onClick={() => setPatchModalPatient(null)}
        >
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Quick Update (PATCH)</h2>
                <p>Patient {patchModalPatient.pa_name} (ID: #{patchModalPatient.pa_id})</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setPatchModalPatient(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePatchSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Field to Update</label>
                  <select
                    value={patchField}
                    onChange={(e) => {
                      const f = e.target.value;
                      setPatchField(f);
                      if (f === "name") setPatchValue(patchModalPatient.pa_name || "");
                      if (f === "email") setPatchValue(patchModalPatient.pa_email || "");
                      if (f === "phone") setPatchValue(patchModalPatient.pa_phone_number || "");
                    }}
                  >
                    <option value="name">Patient Name (/patient/updatename)</option>
                    <option value="email">Patient Email (/patient/updatemail)</option>
                    <option value="phone">Phone Number (/patient/updateNumber)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    New Value for {patchField === "name" ? "Name" : patchField === "email" ? "Email" : "Phone Number"}
                  </label>
                  <input
                    type={patchField === "email" ? "email" : patchField === "phone" ? "number" : "text"}
                    required
                    value={patchValue}
                    onChange={(e) => setPatchValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setPatchModalPatient(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Execute PATCH"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientManagement;
