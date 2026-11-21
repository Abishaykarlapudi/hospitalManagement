import api from "../api";

export const aiService = {
  // 1. Medical Report Summarizer
  summarizeReport: async (reportText) => {
    const res = await api.post("/api/ai/summarize", { reportText });
    return res.data;
  },

  // 2. Healthcare Information Assistant
  chatAssistant: async (query, context = "") => {
    const res = await api.post("/api/ai/chat", { query, context });
    return res.data;
  },

  // 3. Medical Terminology Explainer
  explainTerm: async (term) => {
    const res = await api.post("/api/ai/explain-term", { term });
    return res.data;
  },

  // 4. Appointment Preparation Suggestions
  getAppointmentPrep: async (specialization, date, time) => {
    const res = await api.post("/api/ai/appointment-prep", {
      specialization,
      date,
      time,
    });
    return res.data;
  },

  // Report API
  getPatientReports: async (patientId) => {
    const res = await api.get(`/api/reports/patient/${patientId}`);
    return res.data;
  },

  uploadReport: async (patientId, reportType, file, notes) => {
    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("reportType", reportType);
    if (file) formData.append("file", file);
    if (notes) formData.append("notes", notes);

    const res = await api.post("/api/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default aiService;
