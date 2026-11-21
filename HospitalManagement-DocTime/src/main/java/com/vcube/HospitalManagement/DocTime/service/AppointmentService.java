package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;

public interface AppointmentService {

	Appointment addAppointment(Appointment a);

	List<Appointment> getAllAppointment();

	List<Appointment> findBydocid(Integer doc_id);

	List<Appointment> findBypaid(Integer pa_id);

	Appointment getAppointmentById(Integer id);

	Appointment updateAppointmentDetails(Appointment a, Integer id);

	Appointment updateAppointmentDate(Appointment a, Integer id);

	Appointment updateAppointmentTime(Appointment a, Integer id);

	Appointment updateAppointmentStatus(Integer id, String status);

	void deleteAppointmentById(Integer id);
}
