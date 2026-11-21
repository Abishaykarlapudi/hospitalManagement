package com.vcube.HospitalManagement.DocTime.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * TB-11: Notification table (Handwritten design)
 * notification_id, user_id, title, message, notification_type, is_read, created_at
 */
@Entity
@Table(name = "notifications")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "notification_id")
	private Long notificationId;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "title", length = 100)
	private String title;

	@Column(name = "message", columnDefinition = "TEXT")
	private String message;

	@Column(name = "notification_type", length = 50)
	private String notificationType = "GENERAL";

	@Column(name = "is_read")
	private Boolean isRead = false;

	@Column(name = "created_at")
	private LocalDateTime createdAt = LocalDateTime.now();
}
