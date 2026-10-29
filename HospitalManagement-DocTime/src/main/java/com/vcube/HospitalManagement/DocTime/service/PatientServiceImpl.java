package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Patient;
import com.vcube.HospitalManagement.DocTime.repo.PatientRepo;

@Service
public class PatientServiceImpl implements PatientService {

	@Autowired
	PatientRepo patientRepo;
	
	@Override
	public ResponseEntity<Patient> addPatient(Patient p) {
		
		return ResponseEntity.status(HttpStatus.CREATED).body(patientRepo.save(p));
	}

	@Override
	public List<Patient> getAllPatient() {
		return patientRepo.findAll();
	}

	@Override
	public Patient getPatientById(Integer id) {
		return patientRepo.findById(id).get();
	}

	@Override
	public Patient updatePatientDetails(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		intoDb.setPa_age(p.getPa_age());
		intoDb.setPa_email(p.getPa_email());
		intoDb.setPa_name(p.getPa_name());
		intoDb.setPa_phone_number(p.getPa_phone_number());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientName(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		intoDb.setPa_name(p.getPa_name());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientEmail(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		intoDb.setPa_email(p.getPa_email());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientPhoneNumber(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		intoDb.setPa_phone_number(p.getPa_phone_number());
		return patientRepo.save(intoDb);
	}

	@Override
	public void deletePatientById(Integer id) {
		patientRepo.deleteById(id);
	}

	

}
