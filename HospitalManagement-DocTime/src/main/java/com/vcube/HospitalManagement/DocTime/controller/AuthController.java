package com.vcube.HospitalManagement.DocTime.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
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
import com.vcube.HospitalManagement.DocTime.entity.Hospital;
import com.vcube.HospitalManagement.DocTime.entity.Patient;
import com.vcube.HospitalManagement.DocTime.entity.User;
import com.vcube.HospitalManagement.DocTime.exception.BadRequestException;
import com.vcube.HospitalManagement.DocTime.exception.ResourceNotFoundException;
import com.vcube.HospitalManagement.DocTime.repo.DoctorRepo;
import com.vcube.HospitalManagement.DocTime.repo.HospitalRepo;
import com.vcube.HospitalManagement.DocTime.repo.PatientRepo;
import com.vcube.HospitalManagement.DocTime.repo.UserRepo;
import com.vcube.HospitalManagement.DocTime.service.BrevoEmailService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final DoctorRepo doctorRepo;
    private final PatientRepo patientRepo;
    private final UserRepo userRepo;
    private final HospitalRepo hospitalRepo;
    private final BrevoEmailService brevoEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(DoctorRepo doctorRepo, PatientRepo patientRepo, UserRepo userRepo,
            HospitalRepo hospitalRepo, BrevoEmailService brevoEmailService) {
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
        this.userRepo = userRepo;
        this.hospitalRepo = hospitalRepo;
        this.brevoEmailService = brevoEmailService;
    }

    /**
     * UNIFIED SINGLE LOGIN FOR ALL ROLES (Hospital Admin, Doctor, Patient)
     * Auto-detects user role and credentials/OTP, redirecting to the right portal.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> unifiedLogin(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", request.get("username"));
        String password = request.get("password");
        String otp = request.get("otp");

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email address is required for authentication.");
        }

        final String targetEmail = email.trim().toLowerCase();

        // 1. Check Hospital Administrator
        if ("admin@doctime.com".equalsIgnoreCase(targetEmail) || "admin".equalsIgnoreCase(targetEmail)) {
            if ((password != null && ("admin123".equals(password) || "admin".equals(password))) || (otp != null && !otp.isBlank())) {
                User adminUser = userRepo.findByEmail("admin@doctime.com").orElseGet(() -> {
                    User u = new User();
                    u.setEmail("admin@doctime.com");
                    u.setFullname("Chief Medical Administrator");
                    u.setRole("HOSPITAL");
                    u.setPasswordHash("admin123");
                    u.setIsVerified(true);
                    return userRepo.save(u);
                });

                Hospital hospital = hospitalRepo.findByUserId(adminUser.getUserId()).orElse(null);

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("success", true);
                resp.put("role", "HOSPITAL");
                resp.put("user", adminUser);
                resp.put("token", "unified-jwt-" + adminUser.getUserId() + "-" + System.currentTimeMillis());
                resp.put("hospital", hospital);
                resp.put("redirectPortal", "/hospital");
                return ResponseEntity.ok(resp);
            }
        }

        // 2. Lookup in TB-1 users table
        Optional<User> optUser = userRepo.findByEmail(targetEmail);
        if (optUser.isPresent()) {
            User user = optUser.get();

            // Verify OTP if provided
            if (otp != null && !otp.isBlank()) {
                if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp.trim())) {
                    throw new BadRequestException("Invalid or expired 6-digit verification code.");
                }
                user.setVerificationOtp(null);
                user.setIsVerified(true);
                userRepo.save(user);
            } else if (password != null && !password.isBlank()) {
                // Verify password
                String passHash = user.getPasswordHash();
                String passPlain = user.getPassword();
                if ((passHash == null || !password.equals(passHash)) && (passPlain == null || !password.equals(passPlain))) {
                    throw new BadRequestException("Incorrect password for " + email);
                }
            }

            String role = user.getRole() != null ? user.getRole().toUpperCase() : "PATIENT";
            String portal = "/patient";
            if ("HOSPITAL".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) portal = "/hospital";
            else if ("DOCTOR".equalsIgnoreCase(role)) portal = "/doctor";

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("role", role);
            resp.put("user", user);
            resp.put("token", "unified-jwt-" + user.getUserId() + "-" + System.currentTimeMillis());
            resp.put("redirectPortal", portal);

            if ("DOCTOR".equalsIgnoreCase(role)) {
                doctorRepo.findAll().stream()
                        .filter(d -> targetEmail.equalsIgnoreCase(d.getDoc_email()))
                        .findFirst().ifPresent(doc -> resp.put("doctor", doc));
            } else if ("PATIENT".equalsIgnoreCase(role)) {
                patientRepo.findAll().stream()
                        .filter(p -> targetEmail.equalsIgnoreCase(p.getPa_email()))
                        .findFirst().ifPresent(pt -> resp.put("patient", pt));
            }
            return ResponseEntity.ok(resp);
        }

        // 3. Check registered Doctor roster
        Optional<Doctor> optDoctor = doctorRepo.findAll().stream()
                .filter(d -> targetEmail.equalsIgnoreCase(d.getDoc_email()))
                .findFirst();

        if (optDoctor.isPresent()) {
            Doctor doc = optDoctor.get();
            User user = new User();
            user.setEmail(doc.getDoc_email());
            user.setFullname(doc.getDoc_name());
            user.setRole("DOCTOR");
            user.setPasswordHash(password != null ? password : "password");
            user.setIsVerified(true);
            user = userRepo.save(user);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("role", "DOCTOR");
            resp.put("user", user);
            resp.put("doctor", doc);
            resp.put("redirectPortal", "/doctor");
            resp.put("token", "unified-doc-token-" + doc.getDoc_id() + "-" + System.currentTimeMillis());
            return ResponseEntity.ok(resp);
        }

        // 4. Check registered Patient roster
        Optional<Patient> optPatient = patientRepo.findAll().stream()
                .filter(p -> targetEmail.equalsIgnoreCase(p.getPa_email()))
                .findFirst();

        if (optPatient.isPresent()) {
            Patient pt = optPatient.get();
            User user = new User();
            user.setEmail(pt.getPa_email());
            user.setFullname(pt.getPa_name());
            user.setRole("PATIENT");
            user.setPasswordHash(password != null ? password : "password");
            user.setIsVerified(true);
            user = userRepo.save(user);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("role", "PATIENT");
            resp.put("user", user);
            resp.put("patient", pt);
            resp.put("redirectPortal", "/patient");
            resp.put("token", "unified-patient-token-" + pt.getPa_id() + "-" + System.currentTimeMillis());
            return ResponseEntity.ok(resp);
        }

        throw new ResourceNotFoundException("No account found with email: " + email + ". Please register first.");
    }

    /**
     * BREVO EMAIL OTP DISPATCH
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String role = request.getOrDefault("role", "PATIENT");

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Recipient email address is required.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

        final String targetEmail = email.trim().toLowerCase();
        final String targetRole = role.toUpperCase();

        User user = userRepo.findByEmail(targetEmail).orElseGet(() -> {
            User u = new User();
            u.setEmail(targetEmail);
            u.setFullname(targetEmail.split("@")[0]);
            u.setRole(targetRole);
            u.setPasswordHash("password");
            return u;
        });

        user.setVerificationOtp(otp);
        user.setOtpExpiry(expiry);
        userRepo.save(user);

        boolean emailSent = brevoEmailService.sendOtpVerificationEmail(targetEmail, user.getFullname(), otp, user.getRole());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "A 6-digit verification code has been dispatched to " + targetEmail);
        resp.put("emailSent", emailSent);
        resp.put("devOtp", otp); // For local testing / evaluation
        resp.put("expiresIn", "10 minutes");
        return ResponseEntity.ok(resp);
    }

    /**
     * BREVO OTP VERIFICATION & SINGLE SESSION CREATION
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
            throw new BadRequestException("Both email and 6-digit OTP code are required.");
        }

        final String targetEmail = email.trim().toLowerCase();

        User user = userRepo.findByEmail(targetEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for " + email));

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp.trim())) {
            throw new BadRequestException("Invalid or expired 6-digit code.");
        }

        user.setVerificationOtp(null);
        user.setIsVerified(true);
        userRepo.save(user);

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "PATIENT";
        String portal = "/patient";
        if ("HOSPITAL".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) portal = "/hospital";
        else if ("DOCTOR".equalsIgnoreCase(role)) portal = "/doctor";

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("role", role);
        resp.put("user", user);
        resp.put("token", "unified-jwt-" + user.getUserId() + "-" + System.currentTimeMillis());
        resp.put("redirectPortal", portal);

        if ("DOCTOR".equalsIgnoreCase(role)) {
            doctorRepo.findAll().stream()
                    .filter(d -> targetEmail.equalsIgnoreCase(d.getDoc_email()))
                    .findFirst().ifPresent(doc -> resp.put("doctor", doc));
        } else if ("PATIENT".equalsIgnoreCase(role)) {
            patientRepo.findAll().stream()
                    .filter(p -> targetEmail.equalsIgnoreCase(p.getPa_email()))
                    .findFirst().ifPresent(pt -> resp.put("patient", pt));
        }

        return ResponseEntity.ok(resp);
    }

    /**
     * UNIFIED USER REGISTRATION WITH BREVO OTP DISPATCH
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String fullname = (String) payload.get("fullname");
        String password = (String) payload.getOrDefault("password", "password123");
        String phone = (String) payload.get("phone");
        String role = (String) payload.getOrDefault("role", "PATIENT");

        if (email == null || email.isBlank() || fullname == null || fullname.isBlank()) {
            throw new BadRequestException("Full name and email address are required.");
        }

        final String targetEmail = email.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepo.findByEmail(targetEmail);
        User user;
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (Boolean.TRUE.equals(existing.getIsVerified())) {
                throw new BadRequestException("An account already exists and is verified with email: " + email + ". Please sign in using your email and password.");
            }
            user = existing;
            user.setFullname(fullname.trim());
            user.setPassword(password);
            user.setPasswordHash(password);
            user.setPhone(phone);
            user.setRole(role.toUpperCase());
        } else {
            user = new User();
            user.setEmail(targetEmail);
            user.setFullname(fullname.trim());
            user.setPassword(password);
            user.setPasswordHash(password);
            user.setPhone(phone);
            user.setRole(role.toUpperCase());
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setIsVerified(false);
        user.setVerificationOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        final User savedUser = userRepo.save(user);

        // Also create/update role-specific profile in patient_table, doctor_table, or hospitals
        if ("PATIENT".equalsIgnoreCase(role)) {
            Patient pt = patientRepo.findAll().stream()
                    .filter(p -> targetEmail.equalsIgnoreCase(p.getPa_email()))
                    .findFirst().orElseGet(() -> {
                        Patient p = new Patient();
                        p.setUserId(savedUser.getUserId());
                        return p;
                    });
            pt.setUserId(savedUser.getUserId());
            pt.setFullname(fullname.trim());
            pt.setPa_name(fullname.trim());
            pt.setPa_email(targetEmail);
            if (phone != null && phone.matches("\\d+")) {
                try { pt.setPa_phone_number(Long.parseLong(phone)); } catch (Exception ignored) {}
            }
            if (payload.containsKey("age") && payload.get("age") != null) {
                try { pt.setPa_age(Integer.parseInt(payload.get("age").toString())); } catch (Exception ignored) { pt.setPa_age(28); }
            } else {
                pt.setPa_age(28);
            }
            pt.setBloodGroup((String) payload.getOrDefault("bloodGroup", "O+"));
            pt.setGender((String) payload.getOrDefault("gender", "Female"));
            pt.setAddress((String) payload.getOrDefault("address", "Registered Patient"));
            patientRepo.save(pt);
        } else if ("DOCTOR".equalsIgnoreCase(role)) {
            Doctor doc = doctorRepo.findAll().stream()
                    .filter(d -> targetEmail.equalsIgnoreCase(d.getDoc_email()))
                    .findFirst().orElseGet(() -> {
                        Doctor d = new Doctor();
                        d.setUserId(savedUser.getUserId());
                        return d;
                    });
            doc.setUserId(savedUser.getUserId());
            doc.setFullname(fullname.trim());
            doc.setDoc_name(fullname.trim());
            doc.setDoc_email(targetEmail);
            if (phone != null && phone.matches("\\d+")) {
                try { doc.setDoc_phone_number(Long.parseLong(phone)); } catch (Exception ignored) {}
            }
            doc.setDoc_specialization((String) payload.getOrDefault("specialization", "General Medicine"));
            doctorRepo.save(doc);
        } else if ("HOSPITAL".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            Hospital hosp = hospitalRepo.findByUserId(savedUser.getUserId()).orElseGet(() -> {
                Hospital h = new Hospital();
                h.setUserId(savedUser.getUserId());
                return h;
            });
            hosp.setHospName((String) payload.getOrDefault("hospName", fullname + " Medical Center"));
            hosp.setEmail(targetEmail);
            hosp.setPhone(phone);
            hosp.setAddress((String) payload.getOrDefault("address", "DocTime Healthcare Network"));
            hosp.setCity("Hyderabad");
            hosp.setState("Telangana");
            hosp.setRegistrationNumber("HOSP-" + System.currentTimeMillis() % 100000);
            hospitalRepo.save(hosp);
        }

        boolean emailSent = brevoEmailService.sendOtpVerificationEmail(targetEmail, fullname, otp, role);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Registration successful. A 6-digit verification code has been dispatched via Brevo to " + targetEmail);
        resp.put("user", savedUser);
        resp.put("email", targetEmail);
        resp.put("role", role.toUpperCase());
        resp.put("emailSent", emailSent);
        resp.put("devOtp", otp);
        resp.put("requiresVerification", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * Legacy Hospital Login endpoint for backwards compatibility
     */
    @PostMapping("/hospital-login")
    public ResponseEntity<Map<String, Object>> hospitalLogin(@RequestBody Map<String, String> credentials) {
        return unifiedLogin(credentials);
    }

    /**
     * Check Session
     */
    @PostMapping("/session")
    public ResponseEntity<Map<String, Object>> checkSession() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("online", true);
        resp.put("timestamp", System.currentTimeMillis());
        resp.put("system", "DocTime Healthcare REST API");
        return ResponseEntity.ok(resp);
    }
}
