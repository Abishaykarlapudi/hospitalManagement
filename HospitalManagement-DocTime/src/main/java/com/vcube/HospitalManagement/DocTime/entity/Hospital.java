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
 * TB-3: Hospitals table (Handwritten design)
 * hospital_id, user_id, hosp_name, registration_number, email, phone, address, city, state
 */
@Entity
@Table(name = "hospitals")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "hosp_name", length = 150)
	private String hospName;

	@Column(name = "registration_number", length = 100)
	private String registrationNumber;

	@Column(name = "email", length = 150)
	private String email;

	@Column(name = "phone", length = 15)
	private String phone;

	@Column(name = "address", columnDefinition = "TEXT")
	private String address;

	@Column(name = "city", length = 100)
	private String city;

	@Column(name = "state", length = 50)
	private String state;
}
