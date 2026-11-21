package com.vcube.HospitalManagement.DocTime.entity;

import java.time.LocalDate;

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
 * TB-2: patients table (Handwritten design)
 * patient_id, user_id, fullname, dob, gender, relationship, blood_group, address
 */
@Entity
@Table(name = "patient_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "pa_id")
	private Integer pa_id;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "fullname", length = 100)
	private String fullname;

	@Column(name = "dob")
	private LocalDate dob;

	@Column(name = "gender", length = 20)
	private String gender;

	@Column(name = "relationship", length = 50)
	private String relationship = "Self";

	@Column(name = "blood_group", length = 5)
	private String bloodGroup;

	@Column(name = "address", columnDefinition = "TEXT")
	private String address;

	// Legacy compatibility columns
	@Column(name = "pa_name")
	private String pa_name;

	@Column(name = "pa_age")
	private Integer pa_age;

	@Column(name = "pa_phone_number")
	private Long pa_phone_number;

	@Column(name = "pa_email")
	private String pa_email;

	// Cross-column sync getters/setters
	public Long getPatientId() {
		return pa_id != null ? pa_id.longValue() : null;
	}

	public void setPatientId(Long patientId) {
		this.pa_id = patientId != null ? patientId.intValue() : null;
	}

	public String getPa_name() {
		return pa_name != null ? pa_name : fullname;
	}

	public void setPa_name(String pa_name) {
		this.pa_name = pa_name;
		if (this.fullname == null) this.fullname = pa_name;
	}

	public String getFullname() {
		return fullname != null ? fullname : pa_name;
	}

	public void setFullname(String fullname) {
		this.fullname = fullname;
		if (this.pa_name == null) this.pa_name = fullname;
	}
}
