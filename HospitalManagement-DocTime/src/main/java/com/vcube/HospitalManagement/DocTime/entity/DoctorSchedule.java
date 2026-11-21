package com.vcube.HospitalManagement.DocTime.entity;

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
 * TB-9: Doctor_schedules table (Handwritten design)
 * schedule_id, hospital_doctor_id, available_date, start_time, end_time, slot_duration, max_appointments
 */
@Entity
@Table(name = "doctor_schedules")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSchedule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "schedule_id")
	private Long scheduleId;

	@Column(name = "hospital_doctor_id")
	private Long hospitalDoctorId;

	@Column(name = "available_date")
	private LocalDate availableDate;

	@Column(name = "start_time")
	private String startTime = "09:00";

	@Column(name = "end_time")
	private String endTime = "17:00";

	@Column(name = "slot_duration")
	private Integer slotDuration = 30; // minutes

	@Column(name = "max_appointments")
	private Integer maxAppointments = 15;
}
