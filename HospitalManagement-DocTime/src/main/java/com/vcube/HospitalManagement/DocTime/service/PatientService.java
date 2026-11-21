package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import com.vcube.HospitalManagement.DocTime.entity.Patient;

public interface PatientService {

	Patient addPatient(Patient p);

	List<Patient> getAllPatient();

	Patient getPatientById(Integer id);

	Patient updatePatientDetails(Patient p, Integer id);

	Patient updatePatientName(Patient p, Integer id);

	Patient updatePatientEmail(Patient p, Integer id);

	Patient updatePatientPhoneNumber(Patient p, Integer id);

	void deletePatientById(Integer id);
}
