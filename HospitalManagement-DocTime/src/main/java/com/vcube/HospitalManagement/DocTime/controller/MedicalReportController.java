package com.vcube.HospitalManagement.DocTime.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vcube.HospitalManagement.DocTime.entity.MedicalReport;
import com.vcube.HospitalManagement.DocTime.exception.BadRequestException;
import com.vcube.HospitalManagement.DocTime.repo.MedicalReportRepo;
import com.vcube.HospitalManagement.DocTime.service.GeminiAiService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class MedicalReportController {

	private final MedicalReportRepo reportRepo;
	private final GeminiAiService geminiAiService;

	public MedicalReportController(MedicalReportRepo reportRepo, GeminiAiService geminiAiService) {
		this.reportRepo = reportRepo;
		this.geminiAiService = geminiAiService;
	}

	/**
	 * Get reports for a specific patient
	 */
	@GetMapping("/patient/{patientId}")
	public ResponseEntity<List<MedicalReport>> getPatientReports(@PathVariable Integer patientId) {
		return ResponseEntity.ok(reportRepo.findByPatientIdOrderByCreatedAtDesc(patientId));
	}

	/**
	 * Upload and automatically summarize a patient's medical report
	 */
	@PostMapping("/upload")
	public ResponseEntity<Map<String, Object>> uploadReport(
			@RequestParam("patientId") Integer patientId,
			@RequestParam(value = "reportType", defaultValue = "General Report") String reportType,
			@RequestParam(value = "file", required = false) MultipartFile file,
			@RequestParam(value = "notes", required = false) String notes) {

		if (patientId == null) {
			throw new BadRequestException("Patient ID is required.");
		}

		String fileName = file != null && !file.isEmpty() ? file.getOriginalFilename() : "report_" + System.currentTimeMillis() + ".txt";
		String extractedText = "";

		try {
			if (file != null && !file.isEmpty()) {
				extractedText = new String(file.getBytes());
			}
		} catch (Exception e) {
			extractedText = "Uploaded file content";
		}

		if (notes != null && !notes.isBlank()) {
			extractedText = extractedText + "\n" + notes;
		}

		if (extractedText.isBlank()) {
			extractedText = "Standard health screening report for patient ID: " + patientId;
		}

		// Generate AI Summary using Gemini AI
		String aiSummary = geminiAiService.summarizeReport(extractedText);

		MedicalReport report = new MedicalReport();
		report.setPatientId(patientId);
		report.setFileName(fileName);
		report.setReportType(reportType);
		report.setExtractedText(extractedText);
		report.setAiSummary(aiSummary);

		MedicalReport saved = reportRepo.save(report);

		Map<String, Object> res = new LinkedHashMap<>();
		res.put("success", true);
		res.put("report", saved);
		res.put("message", "Medical report processed and summarized successfully.");
		return ResponseEntity.status(HttpStatus.CREATED).body(res);
	}

	/**
	 * Direct manual entry report creation with AI summary
	 */
	@PostMapping("/create")
	public ResponseEntity<MedicalReport> createReportDirect(@RequestBody MedicalReport report) {
		if (report.getAiSummary() == null || report.getAiSummary().isBlank()) {
			String summary = geminiAiService.summarizeReport(report.getExtractedText() != null ? report.getExtractedText() : "Routine checkup");
			report.setAiSummary(summary);
		}
		MedicalReport saved = reportRepo.save(report);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}
}
