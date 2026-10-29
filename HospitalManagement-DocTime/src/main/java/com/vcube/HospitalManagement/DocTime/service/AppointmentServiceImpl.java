package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;
import com.vcube.HospitalManagement.DocTime.repo.AppointmentRepo;

@Service
public class AppointmentServiceImpl implements AppointmentService {

	@Autowired
	AppointmentRepo appointmentRepo;
	
	@Override
	public ResponseEntity <Appointment> addAppointment(Appointment a) {
//		return appointmentRepo.save(a);
		return ResponseEntity.status(HttpStatus.CREATED).body(appointmentRepo.save(a));
	}

	@Override
	public List<Appointment> getAllAppointment() {
		return appointmentRepo.findAll();
	}

	@Override
	public List<Appointment> findBydocid(Integer doc_id) {
		return appointmentRepo.findAppointmentsByDoctorId(doc_id);
	}

	@Override
	public List<Appointment> findBypaid(Integer pa_id) {
		return appointmentRepo.findAppointmentsByPatientId(pa_id);
	}

	@Override
	public Appointment getAppointmentById(Integer id) {
		return appointmentRepo.findById(id).get();
	}

	@Override
	public Appointment updateAppointmentDetails(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);
		intoDb.setAppointment_date(a.getAppointment_date());
		intoDb.setAppointment_time(a.getAppointment_time());
		return appointmentRepo.save(intoDb);
	}
	
	@Override
	public Appointment updateAppointmentDate(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);
		intoDb.setAppointment_date(a.getAppointment_date());
		return appointmentRepo.save(intoDb);
	}
	
	@Override
	public Appointment updateAppointmentTime(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);
		intoDb.setAppointment_time(a.getAppointment_time());
		return appointmentRepo.save(intoDb);
	}

	@Override
	public void deleteAppointmentById(Integer id) {
		appointmentRepo.deleteById(id);
	}

	
}
