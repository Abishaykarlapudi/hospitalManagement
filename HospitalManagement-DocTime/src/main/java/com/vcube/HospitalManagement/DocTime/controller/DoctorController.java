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

import com.vcube.HospitalManagement.DocTime.entity.Doctor;
import com.vcube.HospitalManagement.DocTime.service.DoctorService;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {
	
	@Autowired
	DoctorService doctorService;
	
	@PostMapping("/create")
	public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor d) {
		return doctorService.addDoctor(d);
	}
	
	@GetMapping("/alldoctors")
	public List<Doctor> getAllDoctors(){
		return doctorService.getAllDoctor();
	}
	
	@GetMapping("/docbyid/{id}")
	public Doctor getDocById(@PathVariable Integer id) {
		return doctorService.getDoctorById(id);
	}
	
	@PutMapping("/updatedetails/{id}")
	public Doctor updateDetails(@RequestBody Doctor d, @PathVariable Integer id) {
		return doctorService.updateDoctorDetails(d, id);
	}
	
	@PatchMapping("/updatename/{id}")
	public Doctor updateName(@RequestBody Doctor d, @PathVariable Integer id) {
		return doctorService.updateDoctorName(d, id);
	}
	
	@PatchMapping("/updatemail/{id}")
	public Doctor updateEmail(@RequestBody Doctor d, @PathVariable Integer id) {
		return doctorService.updateDoctorEmail(d, id);
	}
	
	@PatchMapping("/updateNumber/{id}")
	public Doctor updatePhoneNumber(@RequestBody Doctor d, @PathVariable Integer id) {
		return doctorService.updateDoctorPhoneNumber(d, id);
	}
	
	@DeleteMapping("/delete/{id}")
	public String deleteDoctor(@PathVariable Integer id) {
		doctorService.deleteDoctorById(id);
		return id+" Doctor deleted";
	}
	
}
