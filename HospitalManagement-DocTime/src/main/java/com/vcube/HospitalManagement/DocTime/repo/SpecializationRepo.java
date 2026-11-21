package com.vcube.HospitalManagement.DocTime.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Specialization;

@Repository
public interface SpecializationRepo extends JpaRepository<Specialization, Long> {
}
