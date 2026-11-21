package com.vcube.HospitalManagement.DocTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.HospitalManagement.DocTime.entity.Notification;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
	List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
