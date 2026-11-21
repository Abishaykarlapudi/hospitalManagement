package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;
import com.vcube.HospitalManagement.DocTime.exception.BadRequestException;
import com.vcube.HospitalManagement.DocTime.exception.ResourceNotFoundException;
import com.vcube.HospitalManagement.DocTime.repo.DoctorRepo;

@Service
public class DoctorServiceImpl implements DoctorService {

	private final DoctorRepo doctorRepo;

	public DoctorServiceImpl(DoctorRepo doctorRepo) {
		this.doctorRepo = doctorRepo;
	}

	@Override
	public Doctor addDoctor(Doctor d) {
		if (d.getDoc_email() != null && !d.getDoc_email().isBlank()) {
			String cleanEmail = d.getDoc_email().trim().toLowerCase();
			d.setDoc_email(cleanEmail);
			if (doctorRepo.findByEmail(cleanEmail).isPresent()) {
				throw new BadRequestException("A doctor with email '" + cleanEmail + "' is already registered in the system.");
			}
		}
		return doctorRepo.save(d);
	}

	@Override
	public List<Doctor> getAllDoctor() {
		return doctorRepo.findAll();
	}

	@Override
	public Doctor getDoctorById(Integer id) {
		return doctorRepo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
	}

	@Override
	public Doctor updateDoctorDetails(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		if (d.getDoc_name() != null) intoDb.setDoc_name(d.getDoc_name());
		if (d.getDoc_email() != null) {
			String cleanEmail = d.getDoc_email().trim().toLowerCase();
			if (!cleanEmail.equalsIgnoreCase(intoDb.getDoc_email()) && doctorRepo.findByEmail(cleanEmail).isPresent()) {
				throw new BadRequestException("A doctor with email '" + cleanEmail + "' is already registered.");
			}
			intoDb.setDoc_email(cleanEmail);
		}
		if (d.getDoc_phone_number() != null) intoDb.setDoc_phone_number(d.getDoc_phone_number());
		if (d.getDoc_specialization() != null) intoDb.setDoc_specialization(d.getDoc_specialization());
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorName(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		if (d.getDoc_name() != null) intoDb.setDoc_name(d.getDoc_name());
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorEmail(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		if (d.getDoc_email() != null) {
			String cleanEmail = d.getDoc_email().trim().toLowerCase();
			if (!cleanEmail.equalsIgnoreCase(intoDb.getDoc_email()) && doctorRepo.findByEmail(cleanEmail).isPresent()) {
				throw new BadRequestException("A doctor with email '" + cleanEmail + "' is already registered.");
			}
			intoDb.setDoc_email(cleanEmail);
		}
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorPhoneNumber(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		if (d.getDoc_phone_number() != null) intoDb.setDoc_phone_number(d.getDoc_phone_number());
		return doctorRepo.save(intoDb);
	}

	@Override
	public void deleteDoctorById(Integer id) {
		if (!doctorRepo.existsById(id)) {
			throw new ResourceNotFoundException("Doctor not found with ID: " + id);
		}
		doctorRepo.deleteById(id);
	}
}
