package com.vcube.HospitalManagement.DocTime.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BrevoEmailService {

	private static final Logger logger = LoggerFactory.getLogger(BrevoEmailService.class);

	@Value("${brevo.api.key:}")
	private String apiKey;

	@Value("${brevo.sender.email:admin@doctime.com}")
	private String senderEmail;

	private final RestTemplate restTemplate = new RestTemplate();

	/**
	 * Send transactional email using Brevo (Sendinblue) API v3
	 */
	public boolean sendNotificationEmail(String recipientEmail, String recipientName, String subject, String htmlContent) {
		String key = (apiKey != null && !apiKey.isBlank()) ? apiKey.trim() : System.getenv("BREVO_API_KEY");
		if (key == null || key.isBlank()) {
			key = System.getProperty("BREVO_API_KEY");
		}
		if (key == null || key.isBlank()) {
			logger.warn("Brevo API key is not configured.");
			return false;
		}

		String url = "https://api.brevo.com/v3/smtp/email";

		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("api-key", key.trim());

			Map<String, Object> sender = Map.of(
					"name", "DocTime Healthcare",
					"email", (senderEmail != null && !senderEmail.isBlank()) ? senderEmail.trim() : "noreply@doctime.com"
			);

			Map<String, Object> toItem = Map.of(
					"email", recipientEmail,
					"name", recipientName != null ? recipientName : "Valued Member"
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
			logger.info("ℹ️ Brevo email notice: {} (OTP logged on server console for testing)", e.getMessage());
			return false;
		}
	}

	/**
	 * Send high-security 6-digit OTP email via Brevo
	 */
	public boolean sendOtpVerificationEmail(String recipientEmail, String recipientName, String otpCode, String role) {
		logger.info("📧 [BREVO] Dispatching email verification OTP [{}] to {} (Role: {})", otpCode, recipientEmail, role);

		String subject = "DocTime Security Code: " + otpCode + " - Verify Your Identity";
		String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;'>"
				+ "<div style='display: flex; align-items: center; margin-bottom: 20px;'>"
				+ "<h2 style='color: #0891b2; margin: 0;'>DocTime Healthcare</h2>"
				+ "</div>"
				+ "<p style='color: #334155; font-size: 15px;'>Hello <strong>" + (recipientName != null ? recipientName : "Healthcare Member") + "</strong>,</p>"
				+ "<p style='color: #475569; font-size: 14px;'>Use the following single-use verification code to authenticate your DocTime account (" + role + "):</p>"
				+ "<div style='margin: 24px 0; text-align: center; background: #f0fdfa; border: 2px dashed #0d9488; padding: 18px; border-radius: 10px;'>"
				+ "<span style='font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e;'>" + otpCode + "</span>"
				+ "</div>"
				+ "<p style='color: #64748b; font-size: 12.5px;'>This verification code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>"
				+ "<hr style='border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;'/>"
				+ "<p style='color: #94a3b8; font-size: 11px; text-align: center;'>DocTime Automated Security • Powered by Brevo</p>"
				+ "</div>";

		return sendNotificationEmail(recipientEmail, recipientName, subject, htmlContent);
	}
}
