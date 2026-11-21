package com.vcube.HospitalManagement.DocTime.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Doctor;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Integer> {

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.doc_email) = LOWER(:email)")
    Optional<Doctor> findByEmail(@Param("email") String email);
}
