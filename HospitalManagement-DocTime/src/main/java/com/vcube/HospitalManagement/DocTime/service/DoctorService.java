package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;

public interface DoctorService {

	Doctor addDoctor(Doctor d);

	List<Doctor> getAllDoctor();

	Doctor getDoctorById(Integer id);

	Doctor updateDoctorDetails(Doctor d, Integer id);

	Doctor updateDoctorName(Doctor d, Integer id);

	Doctor updateDoctorEmail(Doctor d, Integer id);

	Doctor updateDoctorPhoneNumber(Doctor d, Integer id);

	void deleteDoctorById(Integer id);
}
