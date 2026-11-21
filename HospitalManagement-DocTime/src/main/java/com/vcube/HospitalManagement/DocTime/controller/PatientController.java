package com.vcube.HospitalManagement.DocTime.controller;

import java.util.List;

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

import com.vcube.HospitalManagement.DocTime.entity.Patient;
import com.vcube.HospitalManagement.DocTime.service.PatientService;

@RestController
@RequestMapping("/patient")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

	private final PatientService patientService;

	public PatientController(PatientService patientService) {
		this.patientService = patientService;
	}

	@PostMapping("/create")
	public ResponseEntity<Patient> addPatient(@RequestBody Patient p) {
		Patient created = patientService.addPatient(p);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@GetMapping({"/allPatients", "/allpatients", "/all", "/getallpatients", "/getpatients", "/getAllPatients"})
	public ResponseEntity<List<Patient>> getAllPatients() {
		return ResponseEntity.ok(patientService.getAllPatient());
	}

	@GetMapping({"/patientbyid/{id}", "/docbyid/{id}", "/{id:[0-9]+}"})
	public ResponseEntity<Patient> getPatientById(@PathVariable Integer id) {
		return ResponseEntity.ok(patientService.getPatientById(id));
	}

	@PutMapping({"/updatedetails/{id}", "/{id}"})
	public ResponseEntity<Patient> updateDetails(@RequestBody Patient p, @PathVariable Integer id) {
		return ResponseEntity.ok(patientService.updatePatientDetails(p, id));
	}

	@PatchMapping("/updatename/{id}")
	public ResponseEntity<Patient> updateName(@RequestBody Patient p, @PathVariable Integer id) {
		return ResponseEntity.ok(patientService.updatePatientName(p, id));
	}

	@PatchMapping("/updatemail/{id}")
	public ResponseEntity<Patient> updateEmail(@RequestBody Patient p, @PathVariable Integer id) {
		return ResponseEntity.ok(patientService.updatePatientEmail(p, id));
	}

	@PatchMapping({"/updateNumber/{id}", "/updatenumber/{id}"})
	public ResponseEntity<Patient> updatePhoneNumber(@RequestBody Patient p, @PathVariable Integer id) {
		return ResponseEntity.ok(patientService.updatePatientPhoneNumber(p, id));
	}

	@DeleteMapping({"/delete/{id}", "/{id}"})
	public ResponseEntity<String> deletePatient(@PathVariable Integer id) {
		patientService.deletePatientById(id);
		return ResponseEntity.ok("Patient with ID " + id + " successfully deleted.");
	}
}
