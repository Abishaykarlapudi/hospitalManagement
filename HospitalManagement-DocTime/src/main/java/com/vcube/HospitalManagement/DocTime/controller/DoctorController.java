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

import com.vcube.HospitalManagement.DocTime.entity.Doctor;
import com.vcube.HospitalManagement.DocTime.service.DoctorService;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

	private final DoctorService doctorService;

	public DoctorController(DoctorService doctorService) {
		this.doctorService = doctorService;
	}

	@PostMapping("/create")
	public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor d) {
		Doctor created = doctorService.addDoctor(d);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@GetMapping({"/alldoctors", "/all", "/getalldoctors", "/getdoctors", "/allDoctors"})
	public ResponseEntity<List<Doctor>> getAllDoctors() {
		return ResponseEntity.ok(doctorService.getAllDoctor());
	}

	@GetMapping({"/docbyid/{id}", "/{id:[0-9]+}"})
	public ResponseEntity<Doctor> getDocById(@PathVariable Integer id) {
		return ResponseEntity.ok(doctorService.getDoctorById(id));
	}

	@PutMapping({"/updatedetails/{id}", "/{id}"})
	public ResponseEntity<Doctor> updateDetails(@RequestBody Doctor d, @PathVariable Integer id) {
		return ResponseEntity.ok(doctorService.updateDoctorDetails(d, id));
	}

	@PatchMapping("/updatename/{id}")
	public ResponseEntity<Doctor> updateName(@RequestBody Doctor d, @PathVariable Integer id) {
		return ResponseEntity.ok(doctorService.updateDoctorName(d, id));
	}

	@PatchMapping("/updatemail/{id}")
	public ResponseEntity<Doctor> updateEmail(@RequestBody Doctor d, @PathVariable Integer id) {
		return ResponseEntity.ok(doctorService.updateDoctorEmail(d, id));
	}

	@PatchMapping({"/updateNumber/{id}", "/updatenumber/{id}"})
	public ResponseEntity<Doctor> updatePhoneNumber(@RequestBody Doctor d, @PathVariable Integer id) {
		return ResponseEntity.ok(doctorService.updateDoctorPhoneNumber(d, id));
	}

	@DeleteMapping({"/delete/{id}", "/{id}"})
	public ResponseEntity<String> deleteDoctor(@PathVariable Integer id) {
		doctorService.deleteDoctorById(id);
		return ResponseEntity.ok("Doctor with ID " + id + " successfully deleted.");
	}
}
