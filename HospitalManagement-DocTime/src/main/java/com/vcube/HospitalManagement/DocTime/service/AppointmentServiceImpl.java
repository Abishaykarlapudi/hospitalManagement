package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;
import com.vcube.HospitalManagement.DocTime.exception.BadRequestException;
import com.vcube.HospitalManagement.DocTime.exception.ResourceNotFoundException;
import com.vcube.HospitalManagement.DocTime.repo.AppointmentRepo;
import com.vcube.HospitalManagement.DocTime.repo.DoctorRepo;
import com.vcube.HospitalManagement.DocTime.repo.PatientRepo;

@Service
public class AppointmentServiceImpl implements AppointmentService {

	private final AppointmentRepo appointmentRepo;
	private final DoctorRepo doctorRepo;
	private final PatientRepo patientRepo;

	public AppointmentServiceImpl(AppointmentRepo appointmentRepo, DoctorRepo doctorRepo, PatientRepo patientRepo) {
		this.appointmentRepo = appointmentRepo;
		this.doctorRepo = doctorRepo;
		this.patientRepo = patientRepo;
	}

	@Override
	public Appointment addAppointment(Appointment a) {
		if (a.getDoc_id() == null) {
			throw new BadRequestException("Doctor ID (doc_id) is required.");
		}
		if (a.getPa_id() == null) {
			throw new BadRequestException("Patient ID (pa_id) is required.");
		}
		if (!doctorRepo.existsById(a.getDoc_id())) {
			throw new ResourceNotFoundException("Cannot book appointment: Doctor not found with ID: " + a.getDoc_id());
		}
		if (!patientRepo.existsById(a.getPa_id())) {
			throw new ResourceNotFoundException("Cannot book appointment: Patient not found with ID: " + a.getPa_id());
		}
		if (a.getStatus() == null || a.getStatus().isBlank()) {
			a.setStatus("BOOKED");
		}
		return appointmentRepo.save(a);
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
		return appointmentRepo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
	}

	@Override
	public Appointment updateAppointmentDetails(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);

		if (a.getDoc_id() != null) {
			if (!doctorRepo.existsById(a.getDoc_id())) {
				throw new ResourceNotFoundException("Cannot update appointment: Doctor not found with ID: " + a.getDoc_id());
			}
			intoDb.setDoc_id(a.getDoc_id());
		}

		if (a.getPa_id() != null) {
			if (!patientRepo.existsById(a.getPa_id())) {
				throw new ResourceNotFoundException("Cannot update appointment: Patient not found with ID: " + a.getPa_id());
			}
			intoDb.setPa_id(a.getPa_id());
		}

		if (a.getAppointment_date() != null) {
			intoDb.setAppointment_date(a.getAppointment_date());
		}
		if (a.getAppointment_time() != null) {
			intoDb.setAppointment_time(a.getAppointment_time());
		}
		if (a.getStatus() != null && !a.getStatus().isBlank()) {
			intoDb.setStatus(a.getStatus());
		}

		return appointmentRepo.save(intoDb);
	}

	@Override
	public Appointment updateAppointmentDate(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);
		if (a.getAppointment_date() != null) {
			intoDb.setAppointment_date(a.getAppointment_date());
		}
		return appointmentRepo.save(intoDb);
	}

	@Override
	public Appointment updateAppointmentTime(Appointment a, Integer id) {
		Appointment intoDb = getAppointmentById(id);
		if (a.getAppointment_time() != null) {
			intoDb.setAppointment_time(a.getAppointment_time());
		}
		return appointmentRepo.save(intoDb);
	}

	@Override
	public Appointment updateAppointmentStatus(Integer id, String status) {
		Appointment intoDb = getAppointmentById(id);
		if (status != null && !status.isBlank()) {
			intoDb.setStatus(status.toUpperCase().trim());
		}
		return appointmentRepo.save(intoDb);
	}

	@Override
	public void deleteAppointmentById(Integer id) {
		if (!appointmentRepo.existsById(id)) {
			throw new ResourceNotFoundException("Appointment not found with ID: " + id);
		}
		appointmentRepo.deleteById(id);
	}
}
