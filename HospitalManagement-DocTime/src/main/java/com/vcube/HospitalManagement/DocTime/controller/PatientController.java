package com.vcube.HospitalManagement.DocTime.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

	@Autowired
	PatientService patientService;
	
	@PostMapping("/create")
	public ResponseEntity<Patient> addPatient(@RequestBody Patient d) {
		return patientService.addPatient(d);
	}
	
	@GetMapping("/allPatients")
	public List<Patient> getAllPatients(){
		return patientService.getAllPatient();
	}
	
	@GetMapping("/docbyid/{id}")
	public Patient getDocById(@PathVariable Integer id) {
		return patientService.getPatientById(id);
	}
	
	@PutMapping("/updatedetails/{id}")
	public Patient updateDetails(@RequestBody Patient d, @PathVariable Integer id) {
		return patientService.updatePatientDetails(d, id);
	}
	
	@PatchMapping("/updatename/{id}")
	public Patient updateName(@RequestBody Patient d, @PathVariable Integer id) {
		return patientService.updatePatientName(d, id);
	}
	
	@PatchMapping("/updatemail/{id}")
	public Patient updateEmail(@RequestBody Patient d, @PathVariable Integer id) {
		return patientService.updatePatientEmail(d, id);
	}
	
	@PatchMapping("/updateNumber/{id}")
	public Patient updatePhoneNumber(@RequestBody Patient d, @PathVariable Integer id) {
		return patientService.updatePatientPhoneNumber(d, id);
	}
	
	@DeleteMapping("/delete/{id}")
	public String deletePatient(@PathVariable Integer id) {
		patientService.deletePatientById(id);
		return id+" Patient deleted";
	}
	
}
