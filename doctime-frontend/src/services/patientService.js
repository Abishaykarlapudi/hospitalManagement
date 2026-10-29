import api from "../api";

export const patientService = {
  // Get all patients
  getAll: async () => {
    const res = await api.get("/patient/allPatients");
    return res.data;
  },

  // Get patient by ID (Backend endpoint is /patient/docbyid/{id})
  getById: async (id) => {
    const res = await api.get(`/patient/docbyid/${id}`);
    return res.data;
  },

  // Add new patient
  // Body: { pa_name, pa_age, pa_phone_number, pa_email }
  create: async (patient) => {
    const payload = {
      pa_name: patient.pa_name.trim(),
      pa_age: Number(patient.pa_age),
      pa_phone_number: Number(patient.pa_phone_number),
      pa_email: patient.pa_email.trim(),
    };
    const res = await api.post("/patient/create", payload);
    return res.data;
  },

  // Update patient details (PUT: pa_name, pa_age, pa_phone_number, pa_email)
  updateDetails: async (id, patient) => {
    const payload = {
      pa_name: patient.pa_name?.trim(),
      pa_age: Number(patient.pa_age),
      pa_phone_number: Number(patient.pa_phone_number),
      pa_email: patient.pa_email?.trim(),
    };
    const res = await api.put(`/patient/updatedetails/${id}`, payload);
    return res.data;
  },

  // PATCH: Update only patient name
  updateName: async (id, pa_name) => {
    const res = await api.patch(`/patient/updatename/${id}`, {
      pa_name: pa_name.trim(),
    });
    return res.data;
  },

  // PATCH: Update only patient email
  updateEmail: async (id, pa_email) => {
    const res = await api.patch(`/patient/updatemail/${id}`, {
      pa_email: pa_email.trim(),
    });
    return res.data;
  },

  // PATCH: Update only patient phone number
  updatePhoneNumber: async (id, pa_phone_number) => {
    const res = await api.patch(`/patient/updateNumber/${id}`, {
      pa_phone_number: Number(pa_phone_number),
    });
    return res.data;
  },

  // Delete patient
  delete: async (id) => {
    const res = await api.delete(`/patient/delete/${id}`);
    return res.data;
  },
};

export default patientService;
