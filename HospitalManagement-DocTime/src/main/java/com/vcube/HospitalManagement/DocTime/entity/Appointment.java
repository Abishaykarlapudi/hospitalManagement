package com.vcube.HospitalManagement.DocTime.entity;

import java.sql.Date;
import java.sql.Time;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

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
@Table(name = "Appointment_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer app_id;

	@Column(name = "doc_id", nullable = false)
	private Integer doc_id;

	@Column(name = "pa_id", nullable = false)
	private Integer pa_id;

	@Column(nullable = false)
	private Date appointment_date;

	@Column(nullable = false)
	private Time appointment_time;

	@Column(name = "status", nullable = false)
	@JsonAlias({"stautes", "status"})
	@JsonProperty("status")
	private String status = "BOOKED";

	// Backward compatibility for legacy clients/frontend expecting "stautes" in JSON
	@JsonProperty("stautes")
	public String getStautes() {
		return this.status;
	}

	public void setStautes(String stautes) {
		if (stautes != null && !stautes.isBlank()) {
			this.status = stautes;
		}
	}
}
