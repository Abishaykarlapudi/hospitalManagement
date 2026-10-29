import api from "../api";

export const doctorService = {
  // Get all doctors
  getAll: async () => {
    const res = await api.get("/doctor/alldoctors");
    return res.data;
  },

  // Get doctor by ID
  getById: async (id) => {
    const res = await api.get(`/doctor/docbyid/${id}`);
    return res.data;
  },

  // Add new doctor
  // Body: { doc_name, doc_specialization, doc_phone_number, doc_email }
  create: async (doctor) => {
    const payload = {
      doc_name: doctor.doc_name.trim(),
      doc_specialization: doctor.doc_specialization.trim(),
      doc_phone_number: Number(doctor.doc_phone_number),
      doc_email: doctor.doc_email.trim(),
    };
    const res = await api.post("/doctor/create", payload);
    return res.data;
  },

  // Update doctor details (Full PUT: doc_name, doc_email, doc_phone_number)
  updateDetails: async (id, doctor) => {
    const payload = {
      doc_name: doctor.doc_name?.trim(),
      doc_email: doctor.doc_email?.trim(),
      doc_phone_number: Number(doctor.doc_phone_number),
      ...(doctor.doc_specialization && { doc_specialization: doctor.doc_specialization.trim() })
    };
    const res = await api.put(`/doctor/updatedetails/${id}`, payload);
    return res.data;
  },

  // PATCH: Update only doctor name
  updateName: async (id, doc_name) => {
    const res = await api.patch(`/doctor/updatename/${id}`, {
      doc_name: doc_name.trim(),
    });
    return res.data;
  },

  // PATCH: Update only doctor email
  updateEmail: async (id, doc_email) => {
    const res = await api.patch(`/doctor/updatemail/${id}`, {
      doc_email: doc_email.trim(),
    });
    return res.data;
  },

  // PATCH: Update only doctor phone number
  updatePhoneNumber: async (id, doc_phone_number) => {
    const res = await api.patch(`/doctor/updateNumber/${id}`, {
      doc_phone_number: Number(doc_phone_number),
    });
    return res.data;
  },

  // Delete doctor
  delete: async (id) => {
    const res = await api.delete(`/doctor/delete/${id}`);
    return res.data;
  },
};

export default doctorService;
