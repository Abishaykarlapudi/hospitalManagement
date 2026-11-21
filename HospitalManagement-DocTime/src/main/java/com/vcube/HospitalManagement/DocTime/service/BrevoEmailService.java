package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BrevoEmailService {

	@Value("${brevo.api.key:}")
	private String apiKey;

	private final RestTemplate restTemplate = new RestTemplate();

	/**
	 * Send transactional email using Brevo (Sendinblue) API v3
	 */
	public boolean sendNotificationEmail(String recipientEmail, String recipientName, String subject, String htmlContent) {
		if (apiKey == null || apiKey.isBlank()) {
			return false;
		}

		String url = "https://api.brevo.com/v3/smtp/email";

		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("api-key", apiKey.trim());

			Map<String, Object> sender = Map.of(
					"name", "DocTime Healthcare",
					"email", "noreply@doctime.com"
			);

			Map<String, Object> toItem = Map.of(
					"email", recipientEmail,
					"name", recipientName != null ? recipientName : "Valued Patient"
			);

			Map<String, Object> body = Map.of(
					"sender", sender,
					"to", List.of(toItem),
					"subject", subject,
					"htmlContent", htmlContent
			);

			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
			ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
			return response.getStatusCode().is2xxSuccessful();
		} catch (Exception e) {
			// Log silently or handle graceful fallback
			return false;
		}
	}
}
