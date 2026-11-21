import React, { useState, useEffect } from "react";
import { FileText, Upload, Sparkles, AlertCircle, RefreshCw, Eye, CheckCircle2 } from "lucide-react";
import aiService from "../services/aiService";
import AnimatedList from "./AnimatedList";
import SpecularButton from "./SpecularButton";

export function MedicalReportsManager({ patientId, patientName, showToast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [reportType, setReportType] = useState("Blood Test / Complete Blood Count");
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState("");

  // Viewing summary modal
  const [activeReport, setActiveReport] = useState(null);

  const fetchReports = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const data = await aiService.getPatientReports(patientId);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("error", "Failed to load medical reports: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [patientId]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim() && !selectedFile) {
      showToast("error", "Please provide clinical notes or choose a report file.");
      return;
    }

    setUploading(true);
    try {
      const res = await aiService.uploadReport(patientId, reportType, selectedFile, notes);
      showToast("success", "Medical report uploaded and summarized by Gemini AI!");
      setSelectedFile(null);
      setNotes("");
      fetchReports();
      if (res.report) {
        setActiveReport(res.report);
      }
    } catch (err) {
      showToast("error", "Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Prepare items for AnimatedList
  const animatedReportItems = reports.map((rep) => ({
    id: rep.id,
    title: rep.fileName,
    description: rep.reportType || "Clinical Record",
    meta: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "Recent",
    icon: <FileText size={18} color="#06b6d4" />,
    raw: rep,
  }));

  return (
    <div className="glass-card reports-panel">
      <div className="glass-card-header">
        <div>
          <h3 className="glass-title">
            <FileText size={20} color="#06b6d4" />
            Medical History & AI Lab Summaries
          </h3>
          <p className="glass-subtitle">
            Securely upload clinical records. Powered by Gemini 1.5 to provide structured plain-English summaries.
          </p>
        </div>
        <SpecularButton
          size="sm"
          radius={12}
          tint="#06b6d4"
          tintOpacity={0.15}
          textColor="#e2e8f0"
          lineColor="#38bdf8"
          baseColor="#0891b2"
          onClick={fetchReports}
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </SpecularButton>
      </div>

      <div className="reports-layout-grid">
        {/* Upload Form Box */}
        <div className="upload-box glass-panel">
          <h4>Upload New Clinical Report</h4>
          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label>Report Classification</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Lipid Profile & Cholesterol">Lipid Profile & Cholesterol</option>
                <option value="Thyroid & Hormonal Panel">Thyroid & Hormonal Panel</option>
                <option value="Radiology / MRI / CT Scan">Radiology / MRI / CT Scan</option>
                <option value="Discharge Summary & Prescription">Discharge Summary & Prescription</option>
                <option value="General Health Checkup">General Health Checkup</option>
              </select>
            </div>

            <div className="form-group">
              <label>Attach File (PDF, TXT, Image)</label>
              <input
                type="file"
                className="glass-file-input"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              />
            </div>

            <div className="form-group">
              <label>Clinical Notes or Key Parameters</label>
              <textarea
                rows={3}
                placeholder="e.g. Hemoglobin 11.2, Platelets 220,000, Fasting Glucose 118 mg/dL. Patient reports mild fatigue..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <SpecularButton
              size="lg"
              radius={14}
              tint="#06b6d4"
              tintOpacity={0.25}
              textColor="#ffffff"
              lineColor="#67e8f9"
              baseColor="#0e7490"
              intensity={1.2}
              type="submit"
              disabled={uploading}
              style={{ width: "100%", marginTop: "12px" }}
            >
              <Sparkles size={16} />
              <span>{uploading ? "Analyzing with Gemini AI..." : "Upload & Generate AI Summary"}</span>
            </SpecularButton>
          </form>
        </div>

        {/* Existing Reports Animated List */}
        <div className="reports-list-box glass-panel">
          <h4>Report Records ({reports.length})</h4>
          {loading ? (
            <div className="glass-empty">Loading records...</div>
          ) : reports.length === 0 ? (
            <div className="glass-empty">
              <FileText size={32} opacity={0.4} />
              <p>No medical reports uploaded yet. Upload your first report to get an AI summary.</p>
            </div>
          ) : (
            <AnimatedList
              items={animatedReportItems}
              onItemSelect={(item) => setActiveReport(item.raw)}
              animation="pop"
              theme="dark"
              width="100%"
              maxHeight={360}
              radius={12}
              gap={8}
              stagger={0.05}
              selectOnHover={true}
              enableArrowNavigation={true}
            />
          )}
        </div>
      </div>

      {/* Report Summary Modal */}
      {activeReport && (
        <div className="glass-modal-backdrop" onClick={() => setActiveReport(null)}>
          <div className="glass-modal-container report-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div className="ai-header-title">
                <FileText size={22} color="#06b6d4" />
                <div>
                  <h3>{activeReport.reportType || "Medical Report"}</h3>
                  <p className="ai-sub-tag">File: {activeReport.fileName}</p>
                </div>
              </div>
              <button className="glass-close-btn" onClick={() => setActiveReport(null)}>
                ×
              </button>
            </div>

            <div className="report-modal-body">
              <div className="report-summary-box">
                <div className="ai-badge-row">
                  <Sparkles size={16} color="#06b6d4" />
                  <strong>AI-Powered Clinical Summary</strong>
                </div>
                <div className="markdown-render ai-summary-content">
                  {activeReport.aiSummary || "No summary available."}
                </div>
              </div>

              {activeReport.extractedText && (
                <details className="raw-text-accordion">
                  <summary>View Extracted Report Text</summary>
                  <pre>{activeReport.extractedText}</pre>
                </details>
              )}

              <div className="ai-disclaimer-banner">
                <AlertCircle size={14} color="#f59e0b" />
                <span>AI summaries assist consultation. AI must not independently diagnose or prescribe medicine.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalReportsManager;
