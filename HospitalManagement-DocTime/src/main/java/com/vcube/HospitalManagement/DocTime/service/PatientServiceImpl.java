package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Patient;
import com.vcube.HospitalManagement.DocTime.exception.ResourceNotFoundException;
import com.vcube.HospitalManagement.DocTime.repo.PatientRepo;

@Service
public class PatientServiceImpl implements PatientService {

	private final PatientRepo patientRepo;

	public PatientServiceImpl(PatientRepo patientRepo) {
		this.patientRepo = patientRepo;
	}

	@Override
	public Patient addPatient(Patient p) {
		return patientRepo.save(p);
	}

	@Override
	public List<Patient> getAllPatient() {
		return patientRepo.findAll();
	}

	@Override
	public Patient getPatientById(Integer id) {
		return patientRepo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
	}

	@Override
	public Patient updatePatientDetails(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		if (p.getPa_age() != null) intoDb.setPa_age(p.getPa_age());
		if (p.getPa_email() != null) intoDb.setPa_email(p.getPa_email());
		if (p.getPa_name() != null) intoDb.setPa_name(p.getPa_name());
		if (p.getPa_phone_number() != null) intoDb.setPa_phone_number(p.getPa_phone_number());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientName(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		if (p.getPa_name() != null) intoDb.setPa_name(p.getPa_name());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientEmail(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		if (p.getPa_email() != null) intoDb.setPa_email(p.getPa_email());
		return patientRepo.save(intoDb);
	}

	@Override
	public Patient updatePatientPhoneNumber(Patient p, Integer id) {
		Patient intoDb = getPatientById(id);
		if (p.getPa_phone_number() != null) intoDb.setPa_phone_number(p.getPa_phone_number());
		return patientRepo.save(intoDb);
	}

	@Override
	public void deletePatientById(Integer id) {
		if (!patientRepo.existsById(id)) {
			throw new ResourceNotFoundException("Patient not found with ID: " + id);
		}
		patientRepo.deleteById(id);
	}
}
