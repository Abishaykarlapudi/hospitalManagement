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
 * TB-6: Qualification table (Handwritten design)
 * qualification_id, qualification_name, description
 */
@Entity
@Table(name = "qualification")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Qualification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "qualification_id")
	private Long qualificationId;

	@Column(name = "qualification_name", length = 100)
	private String qualificationName;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;
}
