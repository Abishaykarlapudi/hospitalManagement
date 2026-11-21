package com.vcube.HospitalManagement.DocTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Department;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long> {
	List<Department> findByHospitalId(Long hospitalId);
}
