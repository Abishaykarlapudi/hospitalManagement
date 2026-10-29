package com.vcube.HospitalManagement.DocTime.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Integer>{

}
