import React, { useState, useMemo } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Zap,
  Eye,
  Mail,
  Phone,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import doctorService from "../services/doctorService";

const COMMON_SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
  "Dermatology",
  "Gynecology",
  "Ophthalmology",
  "ENT Specialist",
  "General Surgery",
  "Psychiatry",
  "Head Doctor",
];

export function DoctorManagement({
  doctors,
  appointments,
  onRefresh,
  showToast,
  isAddModalOpen,
  setIsAddModalOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("ALL");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [patchModalDoctor, setPatchModalDoctor] = useState(null);
  const [patchField, setPatchField] = useState("name");
  const [patchValue, setPatchValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    doc_name: "",
    doc_specialization: "",
    doc_phone_number: "",
    doc_email: "",
  });

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        (doc.doc_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.doc_specialization || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.doc_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(doc.doc_phone_number || "").includes(searchTerm) ||
        String(doc.doc_id || "").includes(searchTerm);

      const matchSpec =
        selectedSpec === "ALL" || doc.doc_specialization === selectedSpec;

      return matchSearch && matchSpec;
    });
  }, [doctors, searchTerm, selectedSpec]);

  // Specialization list for dropdown
  const specs = useMemo(() => {
    const set = new Set(doctors.map((d) => d.doc_specialization).filter(Boolean));
    return Array.from(set);
  }, [doctors]);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setForm({
      doc_name: "",
      doc_specialization: "",
      doc_phone_number: "",
      doc_email: "",
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setForm({
      doc_name: doc.doc_name || "",
      doc_specialization: doc.doc_specialization || "",
      doc_phone_number: doc.doc_phone_number || "",
      doc_email: doc.doc_email || "",
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
      if (editingDoctor) {
        // Call backend PUT /doctor/updatedetails/{id}
        await doctorService.updateDetails(editingDoctor.doc_id, form);
        showToast("success", `Dr. ${form.doc_name} details updated successfully.`);
      } else {
        // Call backend POST /doctor/create
        await doctorService.create(form);
        showToast("success", `Dr. ${form.doc_name} registered successfully.`);
      }

      setIsAddModalOpen(false);
      setEditingDoctor(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to save doctor record.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Doctor
  const handleDelete = async (doc) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Dr. ${doc.doc_name} (ID: #${doc.doc_id})?`
      )
    ) {
      return;
    }

    try {
      await doctorService.delete(doc.doc_id);
      showToast("success", `Dr. ${doc.doc_name} was deleted successfully.`);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to delete doctor.");
    }
  };

  // Open quick patch modal
  const handleOpenPatch = (doc, field = "name") => {
    setPatchModalDoctor(doc);
    setPatchField(field);
    if (field === "name") setPatchValue(doc.doc_name || "");
    if (field === "email") setPatchValue(doc.doc_email || "");
    if (field === "phone") setPatchValue(doc.doc_phone_number || "");
  };

  // Submit quick patch
  const handlePatchSubmit = async (e) => {
    e.preventDefault();
    if (!patchModalDoctor) return;
    setSubmitting(true);

    try {
      if (patchField === "name") {
        await doctorService.updateName(patchModalDoctor.doc_id, patchValue);
        showToast("success", `Doctor #${patchModalDoctor.doc_id} name updated to ${patchValue}`);
      } else if (patchField === "email") {
        await doctorService.updateEmail(patchModalDoctor.doc_id, patchValue);
        showToast("success", `Doctor #${patchModalDoctor.doc_id} email updated to ${patchValue}`);
      } else if (patchField === "phone") {
        await doctorService.updatePhoneNumber(patchModalDoctor.doc_id, patchValue);
        showToast("success", `Doctor #${patchModalDoctor.doc_id} phone updated to ${patchValue}`);
      }
      setPatchModalDoctor(null);
      await onRefresh();
    } catch (err) {
      showToast("error", err.message || "Failed to update doctor field.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (doctors.length === 0) {
      showToast("info", "No doctor records to export.");
      return;
    }

    const headers = ["ID", "Name", "Specialization", "Email", "Phone Number"];
    const rows = doctors.map((d) => [
      d.doc_id,
      `"${d.doc_name}"`,
      `"${d.doc_specialization}"`,
      `"${d.doc_email}"`,
      `"${d.doc_phone_number}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `doctime_doctors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Doctor roster exported to CSV.");
  };

  // Get appointments for a doctor
  const getDoctorAppointments = (docId) => {
    return appointments.filter((a) => a.doc_id === docId);
  };

  return (
    <div className="section-container">
      {/* Top Controls Toolbar */}
      <div className="toolbar-card">
        <div className="toolbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search doctors by name, specialization, phone, email, ID..."
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
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
            >
              <option value="ALL">All Specializations ({doctors.length})</option>
              {specs.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <button className="btn outline" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>

          <button className="btn primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Register Doctor
          </button>
        </div>
      </div>

      {/* Doctor Count & Quick Stats Bar */}
      <div className="meta-bar">
        <span>
          Showing <strong>{filteredDoctors.length}</strong> of{" "}
          <strong>{doctors.length}</strong> doctors
        </span>
        {selectedSpec !== "ALL" && (
          <span className="active-filter-tag">
            Filtered by: {selectedSpec}
            <button onClick={() => setSelectedSpec("ALL")}>
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {/* Main Doctors Table */}
      <div className="data-card">
        {filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <Stethoscope size={48} opacity={0.3} />
            <h3>No doctors found</h3>
            <p>
              {searchTerm || selectedSpec !== "ALL"
                ? "Try adjusting your search criteria or clear the filters."
                : "No doctors registered in the database yet. Add your first doctor now!"}
            </p>
            <button className="btn primary" onClick={handleOpenAdd}>
              <Plus size={16} /> Register New Doctor
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Appointments</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => {
                  const docApps = getDoctorAppointments(doc.doc_id);
                  return (
                    <tr key={doc.doc_id}>
                      <td>
                        <span className="id-badge">#{doc.doc_id}</span>
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar-circle doctor">
                            {doc.doc_name?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div>
                            <strong>Dr. {doc.doc_name}</strong>
                            <small className="entity-sub">ID: #{doc.doc_id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="specialization-tag">
                          {doc.doc_specialization}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`mailto:${doc.doc_email}`}
                          className="contact-link"
                        >
                          <Mail size={13} /> {doc.doc_email}
                        </a>
                      </td>
                      <td>
                        <span className="phone-cell">
                          <Phone size={13} /> {doc.doc_phone_number}
                        </span>
                      </td>
                      <td>
                        <span className="count-pill">
                          {docApps.length} scheduled
                        </span>
                      </td>
                      <td>
                        <div className="action-button-group">
                          <button
                            className="action-btn view"
                            title="View Doctor Details"
                            onClick={() => setViewingDoctor(doc)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit Doctor Details (PUT)"
                            onClick={() => handleOpenEdit(doc)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-btn patch"
                            title="Quick PATCH Field"
                            onClick={() => handleOpenPatch(doc, "phone")}
                          >
                            <Zap size={15} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete Doctor"
                            onClick={() => handleDelete(doc)}
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

      {/* Modal: Add / Edit Doctor */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingDoctor ? "Edit Doctor Details" : "Register New Doctor"}</h2>
                <p>
                  {editingDoctor
                    ? `Update record for Dr. ${editingDoctor.doc_name} (#${editingDoctor.doc_id})`
                    : "Add a physician to the DocTime database (POST /doctor/create)"}
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
                    Doctor Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="doc_name"
                    required
                    placeholder="e.g. Nagaraju or Sarah Jenkins"
                    value={form.doc_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Specialization <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="doc_specialization"
                    required
                    placeholder="e.g. Cardiology, Neurology, General Physician"
                    value={form.doc_specialization}
                    onChange={handleChange}
                  />
                  <div className="quick-chip-container">
                    {COMMON_SPECIALIZATIONS.slice(0, 6).map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        className="quick-chip"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            doc_specialization: spec,
                          }))
                        }
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      name="doc_phone_number"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.doc_phone_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      name="doc_email"
                      required
                      placeholder="e.g. doctor@gmail.com"
                      value={form.doc_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-info-box">
                  <Stethoscope size={16} />
                  <span>
                    Backend uses <code>doc_name</code>, <code>doc_specialization</code>, <code>doc_phone_number</code>, and <code>doc_email</code>.
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
                    : editingDoctor
                    ? "Update Doctor"
                    : "Register Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Doctor Details */}
      {viewingDoctor && (
        <div className="modal-backdrop" onClick={() => setViewingDoctor(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Doctor Profile</h2>
                <p>Record ID #{viewingDoctor.doc_id}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setViewingDoctor(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-banner">
                <div className="avatar-circle doctor large">
                  {viewingDoctor.doc_name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <div>
                  <h3>Dr. {viewingDoctor.doc_name}</h3>
                  <span className="specialization-tag">
                    {viewingDoctor.doc_specialization}
                  </span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Doctor ID</span>
                  <span className="detail-value">#{viewingDoctor.doc_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Specialization</span>
                  <span className="detail-value">{viewingDoctor.doc_specialization}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{viewingDoctor.doc_email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{viewingDoctor.doc_phone_number}</span>
                </div>
              </div>

              <div className="section-sub-header">
                <h4>Scheduled Appointments ({getDoctorAppointments(viewingDoctor.doc_id).length})</h4>
              </div>

              {getDoctorAppointments(viewingDoctor.doc_id).length === 0 ? (
                <p className="empty-note">No appointments currently booked with Dr. {viewingDoctor.doc_name}.</p>
              ) : (
                <div className="mini-appointment-list">
                  {getDoctorAppointments(viewingDoctor.doc_id).map((a) => (
                    <div key={a.app_id} className="mini-appointment-item">
                      <div>
                        <strong>App #{a.app_id}</strong>
                        <span>Patient ID: #{a.pa_id}</span>
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
                onClick={() => setViewingDoctor(null)}
              >
                Close
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  const doc = viewingDoctor;
                  setViewingDoctor(null);
                  handleOpenEdit(doc);
                }}
              >
                <Edit2 size={14} /> Edit Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick PATCH Field */}
      {patchModalDoctor && (
        <div
          className="modal-backdrop"
          onClick={() => setPatchModalDoctor(null)}
        >
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Quick Update (PATCH)</h2>
                <p>Dr. {patchModalDoctor.doc_name} (ID: #{patchModalDoctor.doc_id})</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setPatchModalDoctor(null)}
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
                      if (f === "name") setPatchValue(patchModalDoctor.doc_name || "");
                      if (f === "email") setPatchValue(patchModalDoctor.doc_email || "");
                      if (f === "phone") setPatchValue(patchModalDoctor.doc_phone_number || "");
                    }}
                  >
                    <option value="name">Doctor Name (/doctor/updatename)</option>
                    <option value="email">Doctor Email (/doctor/updatemail)</option>
                    <option value="phone">Phone Number (/doctor/updateNumber)</option>
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
                  onClick={() => setPatchModalDoctor(null)}
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

export default DoctorManagement;
