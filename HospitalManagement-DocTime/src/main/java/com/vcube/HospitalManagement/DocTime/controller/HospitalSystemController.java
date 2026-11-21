package com.vcube.HospitalManagement.DocTime.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.HospitalManagement.DocTime.entity.Department;
import com.vcube.HospitalManagement.DocTime.entity.DoctorSchedule;
import com.vcube.HospitalManagement.DocTime.entity.Hospital;
import com.vcube.HospitalManagement.DocTime.entity.HospitalDoctor;
import com.vcube.HospitalManagement.DocTime.entity.Notification;
import com.vcube.HospitalManagement.DocTime.entity.Qualification;
import com.vcube.HospitalManagement.DocTime.entity.Specialization;
import com.vcube.HospitalManagement.DocTime.repo.DepartmentRepo;
import com.vcube.HospitalManagement.DocTime.repo.DoctorScheduleRepo;
import com.vcube.HospitalManagement.DocTime.repo.HospitalDoctorRepo;
import com.vcube.HospitalManagement.DocTime.repo.HospitalRepo;
import com.vcube.HospitalManagement.DocTime.repo.NotificationRepo;
import com.vcube.HospitalManagement.DocTime.repo.QualificationRepo;
import com.vcube.HospitalManagement.DocTime.repo.SpecializationRepo;

/**
 * Controller exposing the handwritten 11-table database features
 */
@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class HospitalSystemController {

	private final HospitalRepo hospitalRepo;
	private final DepartmentRepo departmentRepo;
	private final QualificationRepo qualificationRepo;
	private final SpecializationRepo specializationRepo;
	private final HospitalDoctorRepo hospitalDoctorRepo;
	private final DoctorScheduleRepo doctorScheduleRepo;
	private final NotificationRepo notificationRepo;

	public HospitalSystemController(HospitalRepo hospitalRepo, DepartmentRepo departmentRepo,
			QualificationRepo qualificationRepo, SpecializationRepo specializationRepo,
			HospitalDoctorRepo hospitalDoctorRepo, DoctorScheduleRepo doctorScheduleRepo,
			NotificationRepo notificationRepo) {
		this.hospitalRepo = hospitalRepo;
		this.departmentRepo = departmentRepo;
		this.qualificationRepo = qualificationRepo;
		this.specializationRepo = specializationRepo;
		this.hospitalDoctorRepo = hospitalDoctorRepo;
		this.doctorScheduleRepo = doctorScheduleRepo;
		this.notificationRepo = notificationRepo;
	}

	// TB-3: Hospitals
	@GetMapping("/hospitals")
	public List<Hospital> getHospitals() {
		return hospitalRepo.findAll();
	}

	@PostMapping("/hospitals")
	public ResponseEntity<Hospital> createHospital(@RequestBody Hospital hospital) {
		return ResponseEntity.status(HttpStatus.CREATED).body(hospitalRepo.save(hospital));
	}

	// TB-4: Departments
	@GetMapping("/departments")
	public List<Department> getDepartments() {
		return departmentRepo.findAll();
	}

	@PostMapping("/departments")
	public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
		return ResponseEntity.status(HttpStatus.CREATED).body(departmentRepo.save(department));
	}

	// TB-6: Qualification
	@GetMapping("/qualifications")
	public List<Qualification> getQualifications() {
		return qualificationRepo.findAll();
	}

	@PostMapping("/qualifications")
	public ResponseEntity<Qualification> createQualification(@RequestBody Qualification q) {
		return ResponseEntity.status(HttpStatus.CREATED).body(qualificationRepo.save(q));
	}

	// TB-7: Specialization
	@GetMapping("/specializations")
	public List<Specialization> getSpecializations() {
		return specializationRepo.findAll();
	}

	@PostMapping("/specializations")
	public ResponseEntity<Specialization> createSpecialization(@RequestBody Specialization s) {
		return ResponseEntity.status(HttpStatus.CREATED).body(specializationRepo.save(s));
	}

	// TB-8: Hospital Doctors
	@GetMapping("/hospital-doctors")
	public List<HospitalDoctor> getHospitalDoctors() {
		return hospitalDoctorRepo.findAll();
	}

	@PostMapping("/hospital-doctors")
	public ResponseEntity<HospitalDoctor> assignDoctorToHospital(@RequestBody HospitalDoctor hd) {
		return ResponseEntity.status(HttpStatus.CREATED).body(hospitalDoctorRepo.save(hd));
	}

	// TB-9: Doctor Schedules
	@GetMapping("/schedules")
	public List<DoctorSchedule> getSchedules() {
		return doctorScheduleRepo.findAll();
	}

	@PostMapping("/schedules")
	public ResponseEntity<DoctorSchedule> createSchedule(@RequestBody DoctorSchedule schedule) {
		return ResponseEntity.status(HttpStatus.CREATED).body(doctorScheduleRepo.save(schedule));
	}

	// TB-11: Notifications
	@GetMapping("/notifications/{userId}")
	public List<Notification> getUserNotifications(@PathVariable Long userId) {
		return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
	}

	@PostMapping("/notifications")
	public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
		return ResponseEntity.status(HttpStatus.CREATED).body(notificationRepo.save(notification));
	}
}
