package com.vcube.HospitalManagement.DocTime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "doctor_table")
@Setter
@Getter
public class Doctor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer doc_id;

	@Column(nullable = false)
	String doc_name;

	@Column(nullable = false)
	String doc_specialization;

	@Column(nullable = false)
	Long doc_phone_number;

	@Column(unique = true, nullable = false)
	String doc_email;
}
