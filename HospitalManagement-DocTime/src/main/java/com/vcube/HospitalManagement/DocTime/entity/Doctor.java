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

@Entity
@Table(name = "doctor_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer doc_id;

	@Column(nullable = false)
	private String doc_name;

	@Column(nullable = false)
	private String doc_specialization;

	@Column(nullable = false)
	private Long doc_phone_number;

	@Column(unique = true, nullable = false)
	private String doc_email;
}
