package com.vcube.HospitalManagement.DocTime.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;
import com.vcube.HospitalManagement.DocTime.entity.Patient;
import com.vcube.HospitalManagement.DocTime.exception.BadRequestException;
import com.vcube.HospitalManagement.DocTime.exception.ResourceNotFoundException;
import com.vcube.HospitalManagement.DocTime.repo.DoctorRepo;
import com.vcube.HospitalManagement.DocTime.repo.PatientRepo;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final DoctorRepo doctorRepo;
    private final PatientRepo patientRepo;

    public AuthController(DoctorRepo doctorRepo, PatientRepo patientRepo) {
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
    }

    /**
     * Hospital / Administration Login
     */
    @PostMapping("/hospital-login")
    public ResponseEntity<Map<String, Object>> hospitalLogin(@RequestBody Map<String, String> credentials) {
        String username = credentials.getOrDefault("username", credentials.get("email"));
        String password = credentials.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new BadRequestException("Username and password are required.");
        }

        // Standard Hospital Admin credential check (supports admin or doctime-admin)
        boolean isValid = ("admin@doctime.com".equalsIgnoreCase(username.trim()) || "admin".equalsIgnoreCase(username.trim()))
                && ("admin123".equals(password) || "admin".equals(password));

        if (!isValid) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", "Invalid hospital credentials. (Hint: admin@doctime.com / admin123)");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("role", "HOSPITAL");
        res.put("username", "Hospital Administrator");
        res.put("email", "admin@doctime.com");
        res.put("token", "hospital-auth-token-" + System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }

    /**
     * Doctor Login by email
     */
    @PostMapping("/doctor-login")
    public ResponseEntity<Map<String, Object>> doctorLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Doctor email is required.");
        }

        Optional<Doctor> optDoctor = doctorRepo.findByEmail(email.trim());
        if (optDoctor.isEmpty()) {
            throw new ResourceNotFoundException("No doctor registered with email: " + email);
        }

        Doctor doctor = optDoctor.get();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("role", "DOCTOR");
        res.put("doctor", doctor);
        res.put("token", "doctor-auth-token-" + doctor.getDoc_id() + "-" + System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }

    /**
     * Patient / User Login by email
     */
    @PostMapping("/patient-login")
    public ResponseEntity<Map<String, Object>> patientLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Patient email is required.");
        }

        Optional<Patient> optPatient = patientRepo.findByEmail(email.trim());
        if (optPatient.isEmpty()) {
            throw new ResourceNotFoundException("No patient registered with email: " + email);
        }

        Patient patient = optPatient.get();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("role", "PATIENT");
        res.put("patient", patient);
        res.put("token", "patient-auth-token-" + patient.getPa_id() + "-" + System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }

    /**
     * Patient Registration & instant login
     */
    @PostMapping("/patient-register")
    public ResponseEntity<Map<String, Object>> patientRegister(@RequestBody Patient patient) {
        if (patient.getPa_name() == null || patient.getPa_name().isBlank()) {
            throw new BadRequestException("Patient name is required.");
        }
        if (patient.getPa_email() == null || patient.getPa_email().isBlank()) {
            throw new BadRequestException("Patient email is required.");
        }

        Optional<Patient> existing = patientRepo.findByEmail(patient.getPa_email().trim());
        if (existing.isPresent()) {
            throw new BadRequestException("A patient with email " + patient.getPa_email() + " is already registered.");
        }

        Patient saved = patientRepo.save(patient);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("role", "PATIENT");
        res.put("patient", saved);
        res.put("token", "patient-auth-token-" + saved.getPa_id() + "-" + System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}
