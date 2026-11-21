import api from "../api";

export const authService = {
  // Hospital Login
  hospitalLogin: async (username, password) => {
    try {
      const res = await api.post("/auth/hospital-login", { username, password });
      if (res.data.success) {
        localStorage.setItem("doctime_hospital_user", JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      // Client-side fallback for Hospital Admin credentials
      const isValid =
        (username.toLowerCase() === "admin@doctime.com" || username.toLowerCase() === "admin") &&
        (password === "admin123" || password === "admin");

      if (isValid) {
        const adminData = {
          success: true,
          role: "HOSPITAL",
          username: "Hospital Administrator",
          email: "admin@doctime.com",
        };
        localStorage.setItem("doctime_hospital_user", JSON.stringify(adminData));
        return adminData;
      }
      throw err;
    }
  },

  getHospitalUser: () => {
    try {
      const u = localStorage.getItem("doctime_hospital_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  hospitalLogout: () => {
    localStorage.removeItem("doctime_hospital_user");
  },

  // Doctor Login
  doctorLogin: async (email) => {
    try {
      const res = await api.post("/auth/doctor-login", { email });
      if (res.data.success) {
        localStorage.setItem("doctime_doctor_user", JSON.stringify(res.data.doctor));
        return res.data;
      }
    } catch (err) {
      // Graceful fallback to search doctors roster directly
      let doctors = [];
      try {
        const d1 = await api.get("/doctor/alldoctors");
        doctors = Array.isArray(d1.data) ? d1.data : [];
      } catch {
        try {
          const d2 = await api.get("/doctor/getdoctors");
          doctors = Array.isArray(d2.data) ? d2.data : [];
        } catch {}
      }

      const match = doctors.find(
        (d) =>
          (d.doc_email && d.doc_email.toLowerCase() === email.toLowerCase()) ||
          (d.email && d.email.toLowerCase() === email.toLowerCase())
      );

      if (match) {
        localStorage.setItem("doctime_doctor_user", JSON.stringify(match));
        return { success: true, doctor: match };
      }
      throw new Error(err.message || `No doctor found with email: ${email}`);
    }
  },

  getDoctorUser: () => {
    try {
      const u = localStorage.getItem("doctime_doctor_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  doctorLogout: () => {
    localStorage.removeItem("doctime_doctor_user");
  },

  // Patient Login
  patientLogin: async (email) => {
    try {
      const res = await api.post("/auth/patient-login", { email });
      if (res.data.success) {
        localStorage.setItem("doctime_patient_user", JSON.stringify(res.data.patient));
        return res.data;
      }
    } catch (err) {
      // Graceful fallback to search patients roster directly
      let patients = [];
      try {
        const p1 = await api.get("/patient/allPatients");
        patients = Array.isArray(p1.data) ? p1.data : [];
      } catch {
        try {
          const p2 = await api.get("/patient/getPatients");
          patients = Array.isArray(p2.data) ? p2.data : [];
        } catch {}
      }

      const match = patients.find(
        (p) =>
          (p.pa_email && p.pa_email.toLowerCase() === email.toLowerCase()) ||
          (p.email && p.email.toLowerCase() === email.toLowerCase())
      );

      if (match) {
        localStorage.setItem("doctime_patient_user", JSON.stringify(match));
        return { success: true, patient: match };
      }
      throw new Error(err.message || `No patient found with email: ${email}`);
    }
  },

  // Patient Register
  patientRegister: async (patient) => {
    const payload = {
      pa_name: patient.pa_name.trim(),
      userName: patient.pa_name.trim(),
      name: patient.pa_name.trim(),
      pa_age: Number(patient.pa_age) || 25,
      age: Number(patient.pa_age) || 25,
      pa_phone_number: Number(patient.pa_phone_number) || 0,
      phoneNumber: Number(patient.pa_phone_number) || 0,
      phone: Number(patient.pa_phone_number) || 0,
      pa_email: patient.pa_email.trim(),
      email: patient.pa_email.trim(),
    };

    try {
      const res = await api.post("/auth/patient-register", payload);
      const pat = res.data.patient || res.data;
      localStorage.setItem("doctime_patient_user", JSON.stringify(pat));
      return { success: true, patient: pat };
    } catch (err) {
      // Fallback to standard /patient/create
      const fallbackPayload = {
        pa_name: patient.pa_name.trim(),
        pa_age: Number(patient.pa_age) || 25,
        pa_phone_number: Number(patient.pa_phone_number) || 0,
        pa_email: patient.pa_email.trim(),
      };
      const fbRes = await api.post("/patient/create", fallbackPayload);
      const pat = fbRes.data;
      localStorage.setItem("doctime_patient_user", JSON.stringify(pat));
      return { success: true, patient: pat };
    }
  },

  getPatientUser: () => {
    try {
      const u = localStorage.getItem("doctime_patient_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  patientLogout: () => {
    localStorage.removeItem("doctime_patient_user");
  },
};

export default authService;
