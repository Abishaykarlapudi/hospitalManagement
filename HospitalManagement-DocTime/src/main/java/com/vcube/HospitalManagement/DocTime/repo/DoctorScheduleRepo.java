package com.vcube.HospitalManagement.DocTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.DoctorSchedule;

@Repository
public interface DoctorScheduleRepo extends JpaRepository<DoctorSchedule, Long> {
	List<DoctorSchedule> findByHospitalDoctorId(Long hospitalDoctorId);
}
