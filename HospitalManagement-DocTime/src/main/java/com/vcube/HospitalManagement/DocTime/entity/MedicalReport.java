package com.vcube.HospitalManagement.DocTime.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medical_reports")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReport {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "patient_id", nullable = false)
	private Integer patientId;

	@Column(name = "file_name", nullable = false)
	private String fileName;

	@Column(name = "report_type")
	private String reportType; // Blood Test, MRI, Prescription, General Lab

	@Column(name = "extracted_text", columnDefinition = "LONGTEXT")
	private String extractedText;

	@Column(name = "ai_summary", columnDefinition = "LONGTEXT")
	private String aiSummary;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@PrePersist
	public void prePersist() {
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
	}
}
