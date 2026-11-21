package com.vcube.HospitalManagement.DocTime;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class HospitalManagementApplication {

	private static final Logger logger = LoggerFactory.getLogger(HospitalManagementApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(HospitalManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate) {
		return args -> {
			logger.info("🛠️ [DocTime] Initializing & verifying 11-table schema (TB-1..TB-11)...");

			try {
				// TB-1: users
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS users ("
						+ "user_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "fullname VARCHAR(100), "
						+ "email VARCHAR(150) NOT NULL UNIQUE, "
						+ "phone VARCHAR(15), "
						+ "password_hash VARCHAR(255), "
						+ "password VARCHAR(255), "
						+ "role VARCHAR(20) NOT NULL, "
						+ "is_verified BOOLEAN DEFAULT TRUE, "
						+ "verification_otp VARCHAR(10), "
						+ "otp_expiry DATETIME"
						+ ")");

				// Ensure backward compatibility on existing users table columns
				try { jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users ADD COLUMN verification_otp VARCHAR(10) NULL"); } catch (Exception ignored) {}
				try { jdbcTemplate.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL"); } catch (Exception ignored) {}

				// TB-2: patient_table (patients)
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS patient_table ("
						+ "pa_id INT AUTO_INCREMENT PRIMARY KEY, "
						+ "user_id BIGINT, "
						+ "fullname VARCHAR(100), "
						+ "dob DATE, "
						+ "gender VARCHAR(20), "
						+ "relationship VARCHAR(50) DEFAULT 'Self', "
						+ "blood_group VARCHAR(5), "
						+ "address TEXT, "
						+ "pa_name VARCHAR(100), "
						+ "pa_age INT, "
						+ "pa_phone_number BIGINT, "
						+ "pa_email VARCHAR(150)"
						+ ")");

				// TB-3: hospitals
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS hospitals ("
						+ "hospital_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "user_id BIGINT, "
						+ "hosp_name VARCHAR(150), "
						+ "registration_number VARCHAR(100), "
						+ "email VARCHAR(150), "
						+ "phone VARCHAR(15), "
						+ "address TEXT, "
						+ "city VARCHAR(100), "
						+ "state VARCHAR(50)"
						+ ")");

				// TB-4: departments
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS departments ("
						+ "department_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "hospital_id BIGINT, "
						+ "department_name VARCHAR(100), "
						+ "description TEXT, "
						+ "status BOOLEAN DEFAULT TRUE"
						+ ")");

				// TB-5: doctor_table (doctor)
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS doctor_table ("
						+ "doc_id INT AUTO_INCREMENT PRIMARY KEY, "
						+ "user_id BIGINT, "
						+ "fullname VARCHAR(100), "
						+ "qualification_id BIGINT, "
						+ "specialization_id BIGINT, "
						+ "registration_number VARCHAR(100), "
						+ "experience_years INT, "
						+ "verification_status VARCHAR(20) DEFAULT 'VERIFIED', "
						+ "doc_name VARCHAR(100), "
						+ "doc_specialization VARCHAR(100), "
						+ "doc_phone_number BIGINT, "
						+ "doc_email VARCHAR(150)"
						+ ")");

				// TB-6: qualification
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS qualification ("
						+ "qualification_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "qualification_name VARCHAR(100), "
						+ "description TEXT"
						+ ")");

				// TB-7: specialization
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS specialization ("
						+ "specialization_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "specialization_name VARCHAR(100), "
						+ "description TEXT"
						+ ")");

				// TB-8: hospital_doctors
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS hospital_doctors ("
						+ "hospital_doctor_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "hospital_id BIGINT, "
						+ "doctor_id BIGINT, "
						+ "department_id BIGINT, "
						+ "consultation_fee DECIMAL(10,2) DEFAULT 500.00, "
						+ "joining_date DATE, "
						+ "status VARCHAR(20) DEFAULT 'ACTIVE'"
						+ ")");

				// TB-9: doctor_schedules
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS doctor_schedules ("
						+ "schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "hospital_doctor_id BIGINT, "
						+ "available_date DATE, "
						+ "start_time VARCHAR(20), "
						+ "end_time VARCHAR(20), "
						+ "slot_duration INT DEFAULT 30, "
						+ "max_appointments INT DEFAULT 15"
						+ ")");

				// TB-10: appointment_table (appointments)
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS appointment_table ("
						+ "app_id INT AUTO_INCREMENT PRIMARY KEY, "
						+ "patient_id BIGINT, "
						+ "hospital_doctor_id BIGINT, "
						+ "schedule_id BIGINT, "
						+ "appointment_date DATE, "
						+ "start_time VARCHAR(20), "
						+ "end_time VARCHAR(20), "
						+ "symptoms TEXT, "
						+ "consultation_reason TEXT, "
						+ "appointment_status VARCHAR(20) DEFAULT 'BOOKED', "
						+ "booked_at DATETIME, "
						+ "doc_id INT, "
						+ "pa_id INT, "
						+ "appointment_time VARCHAR(20), "
						+ "status VARCHAR(20) DEFAULT 'BOOKED'"
						+ ")");

				// TB-11: notifications
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS notifications ("
						+ "notification_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "user_id BIGINT, "
						+ "title VARCHAR(100), "
						+ "message TEXT, "
						+ "notification_type VARCHAR(50) DEFAULT 'GENERAL', "
						+ "is_read BOOLEAN DEFAULT FALSE, "
						+ "created_at DATETIME"
						+ ")");

				// Mandatory AI Table: medical_reports
				jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS medical_reports ("
						+ "report_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
						+ "patient_id INT, "
						+ "patient_name VARCHAR(100), "
						+ "title VARCHAR(150), "
						+ "report_type VARCHAR(50), "
						+ "file_name VARCHAR(255), "
						+ "content_text LONGTEXT, "
						+ "ai_summary LONGTEXT, "
						+ "doctor_notes LONGTEXT, "
						+ "status VARCHAR(30), "
						+ "uploaded_at DATETIME"
						+ ")");

				// Seed default Admin if not exists
				Integer adminCount = jdbcTemplate.queryForObject(
						"SELECT COUNT(*) FROM users WHERE email = 'admin@doctime.com'", Integer.class);
				if (adminCount == null || adminCount == 0) {
					jdbcTemplate.update(
							"INSERT INTO users (fullname, email, phone, password_hash, role, is_verified) "
									+ "VALUES ('Chief Medical Administrator', 'admin@doctime.com', '1800100200', 'admin123', 'HOSPITAL', TRUE)");
				}

				// Seed default Hospital
				Integer hospCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hospitals", Integer.class);
				if (hospCount == null || hospCount == 0) {
					jdbcTemplate.update(
							"INSERT INTO hospitals (user_id, hosp_name, registration_number, email, phone, address, city, state) "
									+ "VALUES (1, 'DocTime Central Clinic & Super Specialty Hospital', 'HOSP-TEL-2026-001', 'contact@doctime.com', '1800100200', 'Road No. 1, Banjara Hills', 'Hyderabad', 'Telangana')");
				}

				// Seed default Departments
				Integer deptCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM departments", Integer.class);
				if (deptCount == null || deptCount == 0) {
					jdbcTemplate.update("INSERT INTO departments (hospital_id, department_name, description, status) VALUES (1, 'Cardiology', 'Heart and cardiovascular care', TRUE)");
					jdbcTemplate.update("INSERT INTO departments (hospital_id, department_name, description, status) VALUES (1, 'Neurology', 'Brain and nervous system care', TRUE)");
					jdbcTemplate.update("INSERT INTO departments (hospital_id, department_name, description, status) VALUES (1, 'Orthopedics', 'Musculoskeletal and bone care', TRUE)");
					jdbcTemplate.update("INSERT INTO departments (hospital_id, department_name, description, status) VALUES (1, 'General Medicine', 'Primary healthcare and diagnostics', TRUE)");
				}

				// Seed default Qualifications
				Integer qualCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM qualification", Integer.class);
				if (qualCount == null || qualCount == 0) {
					jdbcTemplate.update("INSERT INTO qualification (qualification_name, description) VALUES ('MBBS', 'Bachelor of Medicine, Bachelor of Surgery')");
					jdbcTemplate.update("INSERT INTO qualification (qualification_name, description) VALUES ('MD', 'Doctor of Medicine')");
					jdbcTemplate.update("INSERT INTO qualification (qualification_name, description) VALUES ('MS', 'Master of Surgery')");
					jdbcTemplate.update("INSERT INTO qualification (qualification_name, description) VALUES ('DM', 'Doctorate of Medicine (Super-specialty)')");
				}

				// Seed default Specializations
				Integer specCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM specialization", Integer.class);
				if (specCount == null || specCount == 0) {
					jdbcTemplate.update("INSERT INTO specialization (specialization_name, description) VALUES ('Cardiology', 'Cardiac care, ECG, angiography')");
					jdbcTemplate.update("INSERT INTO specialization (specialization_name, description) VALUES ('Neurology', 'Neurological disorders, stroke, EEG')");
					jdbcTemplate.update("INSERT INTO specialization (specialization_name, description) VALUES ('Orthopedics', 'Joint replacement, trauma, fractures')");
					jdbcTemplate.update("INSERT INTO specialization (specialization_name, description) VALUES ('Pediatrics', 'Child healthcare and immunizations')");
					jdbcTemplate.update("INSERT INTO specialization (specialization_name, description) VALUES ('General Medicine', 'General physician and internal medicine')");
				}

				// Seed Doctor nagaraju if not exists
				Integer docCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctor_table WHERE doc_email = 'nagaraju@gamil.com'", Integer.class);
				if (docCount == null || docCount == 0) {
					jdbcTemplate.update(
							"INSERT INTO doctor_table (fullname, doc_name, doc_specialization, doc_phone_number, doc_email, experience_years, verification_status) "
									+ "VALUES ('Dr. nagaraju', 'nagaraju', 'Cardiology', 83886454654, 'nagaraju@gamil.com', 8, 'VERIFIED')");
				}

				// Seed Patient abishay if not exists
				Integer paCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patient_table WHERE pa_email = 'kabishay1@gmail.com'", Integer.class);
				if (paCount == null || paCount == 0) {
					jdbcTemplate.update(
							"INSERT INTO patient_table (fullname, pa_name, pa_age, pa_phone_number, pa_email, gender, blood_group, relationship, address) "
									+ "VALUES ('abishay', 'abishay', 22, 898498485416534, 'kabishay1@gmail.com', 'Male', 'O+', 'Self', 'Hyderabad, India')");
				}

				// Seed sample Appointment if none exists
				Integer appCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM appointment_table", Integer.class);
				if (appCount == null || appCount == 0) {
					jdbcTemplate.update(
							"INSERT INTO appointment_table (doc_id, pa_id, appointment_date, appointment_time, start_time, end_time, symptoms, consultation_reason, status, appointment_status, booked_at) "
									+ "VALUES (1, 1, '2026-11-22', '10:00:00', '10:00:00', '10:30:00', 'Mild chest discomfort and routine heart checkup', 'Routine consultation', 'BOOKED', 'BOOKED', NOW())");
				}

				logger.info("🏥 [DocTime] All 11 tables + AI medical_reports successfully verified and seeded!");

			} catch (Exception e) {
				logger.error("⚠️ [DocTime] Schema verification note: {}", e.getMessage());
			}
		};
	}
}
