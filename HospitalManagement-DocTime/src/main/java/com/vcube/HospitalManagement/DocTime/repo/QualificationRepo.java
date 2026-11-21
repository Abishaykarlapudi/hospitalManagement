package com.vcube.HospitalManagement.DocTime.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Qualification;

@Repository
public interface QualificationRepo extends JpaRepository<Qualification, Long> {
}
