package com.vcube.HospitalManagement.DocTime.entity;

import java.math.BigDecimal;
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
 * TB-8: Hospital_Doctors table (Handwritten design)
 * hospital_doctor_id, hospital_id, doctor_id, department_id, consultation_fee, joining_date, status
 */
@Entity
@Table(name = "hospital_doctors")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HospitalDoctor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "hospital_doctor_id")
	private Long hospitalDoctorId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "doctor_id")
	private Long doctorId;

	@Column(name = "department_id")
	private Long departmentId;

	@Column(name = "consultation_fee", precision = 10, scale = 2)
	private BigDecimal consultationFee = new BigDecimal("500.00");

	@Column(name = "joining_date")
	private LocalDate joiningDate = LocalDate.now();

	@Column(name = "status", length = 20)
	private String status = "ACTIVE";
}
