package com.vcube.HospitalManagement.DocTime.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Patient;

@Repository
public interface PatientRepo extends JpaRepository<Patient, Integer> {

    @Query("SELECT p FROM Patient p WHERE LOWER(p.pa_email) = LOWER(:email)")
    Optional<Patient> findByEmail(@Param("email") String email);
}
