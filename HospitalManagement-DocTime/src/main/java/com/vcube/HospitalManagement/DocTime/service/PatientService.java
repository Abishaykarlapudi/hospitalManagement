package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.vcube.HospitalManagement.DocTime.entity.Patient;

public interface PatientService {

	public abstract ResponseEntity<Patient> addPatient(Patient p);
	
	public abstract List<Patient> getAllPatient();
	
	public abstract Patient getPatientById(Integer id);
	
	public abstract Patient updatePatientDetails(Patient p ,Integer id);
	
	public abstract Patient updatePatientName(Patient p ,Integer id);
	
	public abstract Patient updatePatientEmail(Patient p ,Integer id);
	
	public abstract Patient updatePatientPhoneNumber(Patient p ,Integer id);
	
	public abstract void deletePatientById(Integer id);
	
}
