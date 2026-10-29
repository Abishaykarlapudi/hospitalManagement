import React, { useState } from "react";
import {
  Search,
  Stethoscope,
  Users,
  CalendarCheck,
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import doctorService from "../services/doctorService";
import patientService from "../services/patientService";
import appointmentService from "../services/appointmentService";

export function QuickLookup({ showToast }) {
  const [targetType, setTargetType] = useState("doctor");
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setCopied(false);

    const id = Number(searchId);

    try {
      let data = null;
      if (targetType === "doctor") {
        data = await doctorService.getById(id);
      } else if (targetType === "patient") {
        data = await patientService.getById(id);
      } else if (targetType === "appointment") {
        data = await appointmentService.getById(id);
      }

      if (!data) {
        throw new Error(`No ${targetType} found with ID #${id}`);
      }

      setResult(data);
      showToast("success", `Retrieved ${targetType} record #${id}`);
    } catch (err) {
      const msg = err.message || `Record with ID #${id} not found in database.`;
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("info", "JSON copied to clipboard.");
  };

  return (
    <div className="section-container">
      <div className="lookup-hero">
        <h2>Direct Record Lookup by ID</h2>
        <p>
          Query any specific database record by its primary key using the backend's
          dedicated <code>/docbyid/&#123;id&#125;</code> endpoints.
        </p>

        {/* Target Type Selector */}
        <div className="lookup-type-pills">
          <button
            type="button"
            className={`type-pill ${targetType === "doctor" ? "active" : ""}`}
            onClick={() => {
              setTargetType("doctor");
              setResult(null);
              setError(null);
            }}
          >
            <Stethoscope size={16} />
            <span>Doctor (/doctor/docbyid/&#123;id&#125;)</span>
          </button>
          <button
            type="button"
            className={`type-pill ${targetType === "patient" ? "active" : ""}`}
            onClick={() => {
              setTargetType("patient");
              setResult(null);
              setError(null);
            }}
          >
            <Users size={16} />
            <span>Patient (/patient/docbyid/&#123;id&#125;)</span>
          </button>
          <button
            type="button"
            className={`type-pill ${targetType === "appointment" ? "active" : ""}`}
            onClick={() => {
              setTargetType("appointment");
              setResult(null);
              setError(null);
            }}
          >
            <CalendarCheck size={16} />
            <span>Appointment (/appointment/docbyid/&#123;id&#125;)</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLookup} className="lookup-form">
          <div className="lookup-input-wrap">
            <Search size={20} className="lookup-search-icon" />
            <input
              type="number"
              min="1"
              required
              placeholder={`Enter ${targetType} ID (e.g. 1, 2, 3...)`}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn primary lookup-submit-btn"
            disabled={loading}
          >
            {loading ? "Searching..." : "Lookup Record"}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="lookup-error-card">
          <AlertCircle size={22} />
          <div>
            <strong>Record Not Found</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="lookup-result-card">
          <div className="result-card-header">
            <div className="result-header-title">
              <CheckCircle2 size={20} className="success-icon" />
              <div>
                <h3>
                  {targetType === "doctor"
                    ? `Doctor: Dr. ${result.doc_name}`
                    : targetType === "patient"
                    ? `Patient: ${result.pa_name}`
                    : `Appointment #${result.app_id}`}
                </h3>
                <p>Retrieved from Spring Boot Backend</p>
              </div>
            </div>

            <div className="result-header-actions">
              <button
                className="btn outline btn-sm"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                <Code size={14} /> {showRawJson ? "Show Formatted" : "Show JSON"}
              </button>
              <button
                className="btn outline btn-sm"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>
          </div>

          {showRawJson ? (
            <pre className="raw-json-block">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <div className="formatted-fields-grid">
              {targetType === "doctor" && (
                <>
                  <div className="field-box">
                    <span className="field-lbl">Doctor ID (doc_id)</span>
                    <span className="field-val">#{result.doc_id}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Name (doc_name)</span>
                    <span className="field-val">Dr. {result.doc_name}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Specialization (doc_specialization)</span>
                    <span className="field-val">{result.doc_specialization}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Phone Number (doc_phone_number)</span>
                    <span className="field-val">{result.doc_phone_number}</span>
                  </div>
                  <div className="field-box full">
                    <span className="field-lbl">Email (doc_email)</span>
                    <span className="field-val">{result.doc_email}</span>
                  </div>
                </>
              )}

              {targetType === "patient" && (
                <>
                  <div className="field-box">
                    <span className="field-lbl">Patient ID (pa_id)</span>
                    <span className="field-val">#{result.pa_id}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Name (pa_name)</span>
                    <span className="field-val">{result.pa_name}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Age (pa_age)</span>
                    <span className="field-val">{result.pa_age} years old</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Phone (pa_phone_number)</span>
                    <span className="field-val">{result.pa_phone_number}</span>
                  </div>
                  <div className="field-box full">
                    <span className="field-lbl">Email (pa_email)</span>
                    <span className="field-val">{result.pa_email}</span>
                  </div>
                </>
              )}

              {targetType === "appointment" && (
                <>
                  <div className="field-box">
                    <span className="field-lbl">Appointment ID (app_id)</span>
                    <span className="field-val">#{result.app_id}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Doctor ID (doc_id)</span>
                    <span className="field-val">#{result.doc_id}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Patient ID (pa_id)</span>
                    <span className="field-val">#{result.pa_id}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Date (appointment_date)</span>
                    <span className="field-val">
                      {result.appointment_date ? String(result.appointment_date).split("T")[0] : "--"}
                    </span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Time (appointment_time)</span>
                    <span className="field-val">{result.appointment_time}</span>
                  </div>
                  <div className="field-box">
                    <span className="field-lbl">Status (stautes)</span>
                    <span className="field-val">{result.stautes}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuickLookup;
