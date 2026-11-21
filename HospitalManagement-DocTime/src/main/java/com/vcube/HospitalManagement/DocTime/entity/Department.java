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
 * TB-4: Departments table (Handwritten design)
 * department_id, hospital_id, department_name, description, status
 */
@Entity
@Table(name = "departments")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "department_id")
	private Long departmentId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "department_name", length = 100)
	private String departmentName;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "status")
	private Boolean status = true;
}
