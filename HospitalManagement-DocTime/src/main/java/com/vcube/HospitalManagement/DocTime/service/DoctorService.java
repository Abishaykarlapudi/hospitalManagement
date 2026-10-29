package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;

public interface DoctorService {
	
	public abstract ResponseEntity<Doctor> addDoctor(Doctor d);
	
	public abstract List<Doctor> getAllDoctor();
	
	public abstract Doctor getDoctorById(Integer id);
	
	public abstract Doctor updateDoctorDetails(Doctor d, Integer id);
	
	public abstract Doctor updateDoctorName(Doctor d, Integer id);
	
	public abstract Doctor updateDoctorEmail(Doctor d, Integer id);
	
	public abstract Doctor updateDoctorPhoneNumber(Doctor d, Integer id);
	
	public abstract void deleteDoctorById(Integer id);
}
