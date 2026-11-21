package com.vcube.HospitalManagement.DocTime.entity;

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
 * TB-5: Doctor table (Handwritten design)
 * doctor_id, user_id, fullname, qualification_id, specialization_id, registration_number, experience_years, verification_status
 */
@Entity
@Table(name = "doctor_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "doc_id")
	private Integer doc_id;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "fullname", length = 100)
	private String fullname;

	@Column(name = "qualification_id")
	private Long qualificationId;

	@Column(name = "specialization_id")
	private Long specializationId;

	@Column(name = "registration_number", length = 100)
	private String registrationNumber;

	@Column(name = "experience_years")
	private Integer experienceYears;

	@Column(name = "verification_status", length = 20)
	private String verificationStatus = "VERIFIED";

	// Legacy compatibility columns
	@Column(name = "doc_name")
	private String doc_name;

	@Column(name = "doc_specialization")
	private String doc_specialization;

	@Column(name = "doc_phone_number")
	private Long doc_phone_number;

	@Column(name = "doc_email")
	private String doc_email;

	public Long getDoctorId() {
		return doc_id != null ? doc_id.longValue() : null;
	}

	public void setDoctorId(Long doctorId) {
		this.doc_id = doctorId != null ? doctorId.intValue() : null;
	}

	public String getDoc_name() {
		return doc_name != null ? doc_name : fullname;
	}

	public void setDoc_name(String doc_name) {
		this.doc_name = doc_name;
		if (this.fullname == null) this.fullname = doc_name;
	}

	public String getFullname() {
		return fullname != null ? fullname : doc_name;
	}

	public void setFullname(String fullname) {
		this.fullname = fullname;
		if (this.doc_name == null) this.doc_name = fullname;
	}
}
