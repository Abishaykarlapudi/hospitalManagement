import api from "../api";

export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    const res = await api.get("/appointment/allAppointments");
    return res.data;
  },

  // Get appointment by ID (Backend endpoint is /appointment/docbyid/{id})
  getById: async (id) => {
    const res = await api.get(`/appointment/docbyid/${id}`);
    return res.data;
  },

  // Format time to ensure HH:mm:ss for backend java.sql.Time
  formatTime: (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.trim().split(":");
    if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    }
    if (parts.length === 3) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
    }
    return timeStr;
  },

  // Add new appointment
  // Body: { doc_id, pa_id, appointment_date, appointment_time, stautes }
  create: async (appointment) => {
    const payload = {
      doc_id: Number(appointment.doc_id),
      pa_id: Number(appointment.pa_id),
      appointment_date: appointment.appointment_date,
      appointment_time: appointmentService.formatTime(appointment.appointment_time),
      stautes: appointment.stautes || "BOOKED",
    };
    const res = await api.post("/appointment/create", payload);
    return res.data;
  },

  // Update appointment details (PUT: appointment_date, appointment_time)
  updateDetails: async (id, appointment) => {
    const payload = {
      appointment_date: appointment.appointment_date,
      appointment_time: appointmentService.formatTime(appointment.appointment_time),
      ...(appointment.doc_id && { doc_id: Number(appointment.doc_id) }),
      ...(appointment.pa_id && { pa_id: Number(appointment.pa_id) }),
      ...(appointment.stautes && { stautes: appointment.stautes }),
    };
    const res = await api.put(`/appointment/updatedetails/${id}`, payload);
    return res.data;
  },

  // PATCH: Update only appointment date
  updateDate: async (id, appointment_date) => {
    const res = await api.patch(`/appointment/updatedate/${id}`, {
      appointment_date,
    });
    return res.data;
  },

  // PATCH: Update only appointment time (backend endpoint is /updattime/{id})
  updateTime: async (id, appointment_time) => {
    const formatted = appointmentService.formatTime(appointment_time);
    const res = await api.patch(`/appointment/updattime/${id}`, {
      appointment_time: formatted,
    });
    return res.data;
  },

  // Delete appointment
  delete: async (id) => {
    const res = await api.delete(`/appointment/delete/${id}`);
    return res.data;
  },
};

export default appointmentService;
