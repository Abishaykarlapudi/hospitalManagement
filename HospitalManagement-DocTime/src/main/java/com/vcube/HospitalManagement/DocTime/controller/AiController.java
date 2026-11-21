package com.vcube.HospitalManagement.DocTime.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.HospitalManagement.DocTime.service.GeminiAiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

	private final GeminiAiService geminiAiService;

	public AiController(GeminiAiService geminiAiService) {
		this.geminiAiService = geminiAiService;
	}

	/**
	 * Feature 1: Medical Report Summarizer
	 */
	@PostMapping("/summarize")
	public ResponseEntity<Map<String, Object>> summarizeReport(@RequestBody Map<String, String> payload) {
		String text = payload.getOrDefault("reportText", payload.get("text"));
		String summary = geminiAiService.summarizeReport(text != null ? text : "");
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("success", true);
		res.put("summary", summary);
		return ResponseEntity.ok(res);
	}

	/**
	 * Feature 2: Healthcare Information Assistant
	 */
	@PostMapping("/chat")
	public ResponseEntity<Map<String, Object>> chatWithAssistant(@RequestBody Map<String, String> payload) {
		String query = payload.get("query");
		String context = payload.get("context");
		String response = geminiAiService.askHealthAssistant(query, context);
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("success", true);
		res.put("reply", response);
		return ResponseEntity.ok(res);
	}

	/**
	 * Feature 3: Medical Terminology Explainer
	 */
	@PostMapping("/explain-term")
	public ResponseEntity<Map<String, Object>> explainTerm(@RequestBody Map<String, String> payload) {
		String term = payload.get("term");
		String explanation = geminiAiService.explainMedicalTerm(term != null ? term : "");
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("success", true);
		res.put("explanation", explanation);
		return ResponseEntity.ok(res);
	}

	/**
	 * Feature 4: Appointment Preparation Suggestions
	 */
	@PostMapping("/appointment-prep")
	public ResponseEntity<Map<String, Object>> appointmentPrep(@RequestBody Map<String, String> payload) {
		String specialization = payload.getOrDefault("specialization", "General Medicine");
		String date = payload.getOrDefault("date", "Upcoming consultation");
		String time = payload.getOrDefault("time", "Morning");
		String suggestions = geminiAiService.getAppointmentPreparation(specialization, date, time);
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("success", true);
		res.put("suggestions", suggestions);
		return ResponseEntity.ok(res);
	}
}
