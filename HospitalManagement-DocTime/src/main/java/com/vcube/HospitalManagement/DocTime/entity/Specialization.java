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
 * TB-7: Specialization table (Handwritten design)
 * specialization_id, specialization_name, description
 */
@Entity
@Table(name = "specialization")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Specialization {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "specialization_id")
	private Long specializationId;

	@Column(name = "specialization_name", length = 100)
	private String specializationName;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;
}
