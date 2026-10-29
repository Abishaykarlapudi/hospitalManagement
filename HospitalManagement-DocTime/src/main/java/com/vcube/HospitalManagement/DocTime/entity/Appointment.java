package com.vcube.HospitalManagement.DocTime.entity;

import java.sql.Time;
import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Appointment_table")
@Setter
@Getter
public class Appointment {

	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	Integer app_id;
	
	@JoinColumn(name= "doc_id",referencedColumnName = "doc_id", nullable = false)
	Integer doc_id;
	
	@JoinColumn(name="pa_id",referencedColumnName="pa_id", nullable = false)
	Integer pa_id;
	
	
	Date appointment_date;
	Time appointment_time;
	String stautes;
}
