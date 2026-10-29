package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;
import com.vcube.HospitalManagement.DocTime.repo.DoctorRepo;

@Service
public class DoctorServiceImpl implements DoctorService {

	@Autowired
	DoctorRepo doctorRepo;
	
	@Override
	public ResponseEntity<Doctor> addDoctor(Doctor d) {
//		if we not keep the responseEnt
//		return doctorRepo.save(d);
		return ResponseEntity.status(HttpStatus.CREATED).body(doctorRepo.save(d));
				
	}

	@Override
	public List<Doctor> getAllDoctor() {
		return doctorRepo.findAll();
	}

	@Override
	public Doctor getDoctorById(Integer id) {
		return doctorRepo.findById(id).get();
	}

	@Override
	public Doctor updateDoctorDetails(Doctor d, Integer id) {
		
		Doctor intoDb = getDoctorById(id);
		intoDb.setDoc_email(d.getDoc_email());
		intoDb.setDoc_name(d.getDoc_name());
		intoDb.setDoc_phone_number(d.getDoc_phone_number());
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorName(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		intoDb.setDoc_name(d.getDoc_name());
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorEmail(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		intoDb.setDoc_email(d.getDoc_email());
		return doctorRepo.save(intoDb);
	}

	@Override
	public Doctor updateDoctorPhoneNumber(Doctor d, Integer id) {
		Doctor intoDb = getDoctorById(id);
		intoDb.setDoc_phone_number(d.getDoc_phone_number());
		return doctorRepo.save(intoDb);
	}

	@Override
	public void deleteDoctorById(Integer id) {
		doctorRepo.deleteById(id);
	}

	


}
