package com.vcube.HospitalManagement.DocTime.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * TB-1: user table (Handwritten design)
 * user_id, fullname, email, phone, password_hash, role
 * plus Brevo email verification fields: is_verified, verification_otp, otp_expiry
 */
@Entity
@Table(name = "users")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long userId;

	@Column(name = "fullname", length = 100)
	private String fullname;

	@Column(name = "email", length = 150, nullable = false, unique = true)
	private String email;

	@Column(name = "phone", length = 15)
	private String phone;

	@Column(name = "password_hash", length = 255)
	private String passwordHash;

	@Column(name = "password", length = 255)
	private String password;

	public void setPassword(String password) {
		this.password = password;
		if (this.passwordHash == null) {
			this.passwordHash = password;
		}
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
		if (this.password == null) {
			this.password = passwordHash;
		}
	}

	public String getPassword() {
		return password != null ? password : passwordHash;
	}

	public String getPasswordHash() {
		return passwordHash != null ? passwordHash : password;
	}

	@Column(name = "role", length = 20, nullable = false)
	private String role; // HOSPITAL, DOCTOR, PATIENT

	@Column(name = "is_verified")
	private Boolean isVerified = true;

	@Column(name = "verification_otp", length = 10)
	private String verificationOtp;

	@Column(name = "otp_expiry")
	private LocalDateTime otpExpiry;

	// Backward compatibility accessors
	public Long getId() {
		return userId;
	}

	public void setId(Long id) {
		this.userId = id;
	}
}
