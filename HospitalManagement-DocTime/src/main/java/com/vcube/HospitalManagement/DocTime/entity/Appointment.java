package com.vcube.HospitalManagement.DocTime.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
 * TB-10: appointments table (Handwritten design)
 * appointment_id, patient_id, hospital_doctor_id, schedule_id, appointment_date, start_time, end_time, symptoms, consultation_reason, appointment_status, booked_at
 */
@Entity
@Table(name = "appointment_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "app_id")
	private Integer app_id;

	@Column(name = "patient_id")
	private Long patientId;

	@Column(name = "hospital_doctor_id")
	private Long hospitalDoctorId;

	@Column(name = "schedule_id")
	private Long scheduleId;

	@Column(name = "appointment_date")
	private LocalDate appointment_date;

	@Column(name = "start_time")
	private String startTime;

	@Column(name = "end_time")
	private String endTime;

	@Column(name = "symptoms", columnDefinition = "TEXT")
	private String symptoms;

	@Column(name = "consultation_reason", columnDefinition = "TEXT")
	private String consultationReason;

	@Column(name = "appointment_status", length = 20)
	private String appointmentStatus = "BOOKED";

	@Column(name = "booked_at")
	private LocalDateTime bookedAt = LocalDateTime.now();

	// Legacy compatibility columns
	@Column(name = "doc_id")
	private Integer doc_id;

	@Column(name = "pa_id")
	private Integer pa_id;

	@Column(name = "appointment_time")
	private String appointment_time;

	@Column(name = "status")
	private String status;

	public Long getAppointmentId() {
		return app_id != null ? app_id.longValue() : null;
	}

	public void setAppointmentId(Long appointmentId) {
		this.app_id = appointmentId != null ? appointmentId.intValue() : null;
	}

	public String getStatus() {
		return status != null ? status : appointmentStatus;
	}

	public void setStatus(String status) {
		this.status = status;
		this.appointmentStatus = status;
	}

	public String getAppointmentStatus() {
		return appointmentStatus != null ? appointmentStatus : status;
	}

	public void setAppointmentStatus(String appointmentStatus) {
		this.appointmentStatus = appointmentStatus;
		this.status = appointmentStatus;
	}
}
