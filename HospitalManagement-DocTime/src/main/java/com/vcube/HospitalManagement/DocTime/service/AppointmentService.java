package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;

public interface AppointmentService {

	public abstract ResponseEntity <Appointment> addAppointment(Appointment a);
	
	public abstract List<Appointment> getAllAppointment();
	
	public abstract List<Appointment> findBydocid(Integer doc_id);
	
	public abstract List<Appointment> findBypaid(Integer pa_id);
	
	public abstract Appointment getAppointmentById(Integer id);
	
	public abstract Appointment updateAppointmentDetails(Appointment a ,Integer id);
	
	public Appointment updateAppointmentDate(Appointment a, Integer id);
	
	public Appointment updateAppointmentTime(Appointment a, Integer id);
	
	public abstract void deleteAppointmentById(Integer id);
	
}
