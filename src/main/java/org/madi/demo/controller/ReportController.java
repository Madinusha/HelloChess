package org.madi.demo.controller;

import jakarta.validation.Valid;
import org.madi.demo.dto.CreateReportDTO;
import org.madi.demo.dto.ReportDTO;
import org.madi.demo.dto.ResolveReportDTO;
import org.madi.demo.entities.User;
import org.madi.demo.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@PostMapping
	public ReportDTO createReport(@RequestBody @Valid CreateReportDTO dto,
								  @AuthenticationPrincipal User reporter) {
		return reportService.createReport(dto, reporter);
	}

	@GetMapping
	public Page<ReportDTO> getAllReports(@PageableDefault(size = 20) Pageable pageable) {
		return reportService.getReports(pageable);
	}

	@GetMapping("/pending")
	public List<ReportDTO> getPendingReports() {
		return reportService.getPendingReports();
	}

	@GetMapping("/user/{username}")
	public List<ReportDTO> getReportsByUser(@PathVariable String username) {
		return reportService.getReportsByUser(username);
	}

	@GetMapping("/{id}")
	public ReportDTO getReport(@PathVariable Long id) {
		return reportService.getReportById(id);
	}

	@PostMapping("/{id}/resolve")
	public ReportDTO resolveReport(@PathVariable Long id,
								   @RequestBody @Valid ResolveReportDTO dto,
								   @AuthenticationPrincipal User resolvedBy) {
		return reportService.resolveReport(id, dto, resolvedBy);
	}
}
