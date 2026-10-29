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
@Table(name = "patient_table")
@Setter
@Getter
public class Patient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer pa_id;

	@Column(nullable = false)
	String pa_name;

	@Column(nullable = false)
	Integer pa_age;

	@Column(nullable = false)
	Long pa_phone_number;

	@Column(nullable = false, unique = true)
	String pa_email;

}
