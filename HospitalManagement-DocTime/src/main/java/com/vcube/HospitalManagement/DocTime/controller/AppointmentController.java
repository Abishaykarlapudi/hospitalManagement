package com.vcube.HospitalManagement.DocTime.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;
import com.vcube.HospitalManagement.DocTime.service.AppointmentService;

@RestController
@RequestMapping("/appointment")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

	private final AppointmentService appointmentService;

	public AppointmentController(AppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	@PostMapping("/create")
	public ResponseEntity<Appointment> addAppointment(@RequestBody Appointment a) {
		Appointment created = appointmentService.addAppointment(a);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@GetMapping({"/allAppointments", "/allappointments", "/all", "/getallappointments", "/getappointments", "/getAllAppointments"})
	public ResponseEntity<List<Appointment>> getAllAppointments() {
		return ResponseEntity.ok(appointmentService.getAllAppointment());
	}

	@GetMapping({"/appointmentbyid/{id}", "/docbyid/{id}", "/{id:[0-9]+}"})
	public ResponseEntity<Appointment> getAppointmentById(@PathVariable Integer id) {
		return ResponseEntity.ok(appointmentService.getAppointmentById(id));
	}

	@GetMapping("/doctor/{docId}")
	public ResponseEntity<List<Appointment>> getAppointmentsByDoctorId(@PathVariable Integer docId) {
		return ResponseEntity.ok(appointmentService.findBydocid(docId));
	}

	@GetMapping("/patient/{patientId}")
	public ResponseEntity<List<Appointment>> getAppointmentsByPatientId(@PathVariable Integer patientId) {
		return ResponseEntity.ok(appointmentService.findBypaid(patientId));
	}

	@PutMapping({"/updatedetails/{id}", "/{id}"})
	public ResponseEntity<Appointment> updateDetails(@RequestBody Appointment a, @PathVariable Integer id) {
		return ResponseEntity.ok(appointmentService.updateAppointmentDetails(a, id));
	}

	@PatchMapping("/updatedate/{id}")
	public ResponseEntity<Appointment> updateDate(@RequestBody Appointment a, @PathVariable Integer id) {
		return ResponseEntity.ok(appointmentService.updateAppointmentDate(a, id));
	}

	@PatchMapping({"/updatetime/{id}", "/updattime/{id}"})
	public ResponseEntity<Appointment> updateTime(@RequestBody Appointment a, @PathVariable Integer id) {
		return ResponseEntity.ok(appointmentService.updateAppointmentTime(a, id));
	}

	@PatchMapping("/updatestatus/{id}")
	public ResponseEntity<Appointment> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> statusBody) {
		String status = statusBody.getOrDefault("status", statusBody.get("stautes"));
		return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
	}

	@DeleteMapping({"/delete/{id}", "/{id}"})
	public ResponseEntity<String> deleteAppointment(@PathVariable Integer id) {
		appointmentService.deleteAppointmentById(id);
		return ResponseEntity.ok("Appointment with ID " + id + " successfully deleted.");
	}
}
