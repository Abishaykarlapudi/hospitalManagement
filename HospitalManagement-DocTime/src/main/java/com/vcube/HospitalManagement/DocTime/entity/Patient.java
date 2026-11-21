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
@Table(name = "patient_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer pa_id;

	@Column(nullable = false)
	private String pa_name;

	@Column(nullable = false)
	private Integer pa_age;

	@Column(nullable = false)
	private Long pa_phone_number;

	@Column(nullable = false, unique = true)
	private String pa_email;
}
