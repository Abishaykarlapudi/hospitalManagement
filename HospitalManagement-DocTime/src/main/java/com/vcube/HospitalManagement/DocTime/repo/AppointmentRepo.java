package com.vcube.HospitalManagement.DocTime.repo;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Appointment;

@Repository
public interface AppointmentRepo extends JpaRepository<Appointment, Integer> {

//	List<Appointment> findByDoc_Id(Integer doc_id);
//	
//	List<Appointment> findByPa_Id(Integer pa_id);
	
	 @Query("SELECT a FROM Appointment a WHERE a.doc_id = :docId")
	    List<Appointment> findAppointmentsByDoctorId(
	            @Param("docId") Integer docId);

	    @Query("SELECT a FROM Appointment a WHERE a.pa_id = :patientId")
	    List<Appointment> findAppointmentsByPatientId(
	            @Param("patientId") Integer patientId);
}
