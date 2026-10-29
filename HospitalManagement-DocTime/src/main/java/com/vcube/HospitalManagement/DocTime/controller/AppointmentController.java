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

import com.vcube.HospitalManagement.DocTime.entity.Appointment;
import com.vcube.HospitalManagement.DocTime.service.AppointmentService;

@RestController
@RequestMapping("/appointment")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

	@Autowired
	AppointmentService appointmentService;
	
	@PostMapping("/create")
	public ResponseEntity<Appointment> addAppointment(@RequestBody Appointment d) {
		return appointmentService.addAppointment(d);
	}
	
	@GetMapping("/allAppointments")
	public List<Appointment> getAllAppointments(){
		return appointmentService.getAllAppointment();
	}
	
	@GetMapping("/docbyid/{id}")
	public Appointment getDocById(@PathVariable Integer id) {
		return appointmentService.getAppointmentById(id);
	}
	
	@PutMapping("/updatedetails/{id}")
	public Appointment updateDetails(@RequestBody Appointment d, @PathVariable Integer id) {
		return appointmentService.updateAppointmentDetails(d, id);
	}
	
	@PatchMapping("/updatedate/{id}")
	public Appointment updateName(@RequestBody Appointment d, @PathVariable Integer id) {
		return appointmentService.updateAppointmentDate(d, id);
	}
	
	@PatchMapping("/updattime/{id}")
	public Appointment updateEmail(@RequestBody Appointment d, @PathVariable Integer id) {
		return appointmentService.updateAppointmentTime(d, id);
	}
	
	@DeleteMapping("/delete/{id}")
	public String deleteAppointment(@PathVariable Integer id) {
		appointmentService.deleteAppointmentById(id);
		return id+" Appointment deleted";
	}
	
}
