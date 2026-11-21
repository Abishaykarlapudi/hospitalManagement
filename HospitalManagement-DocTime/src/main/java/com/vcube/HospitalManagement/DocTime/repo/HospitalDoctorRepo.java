package com.vcube.HospitalManagement.DocTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.HospitalDoctor;

@Repository
public interface HospitalDoctorRepo extends JpaRepository<HospitalDoctor, Long> {
	List<HospitalDoctor> findByHospitalId(Long hospitalId);
	List<HospitalDoctor> findByDoctorId(Long doctorId);
}
