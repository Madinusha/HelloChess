package org.madi.demo.service;

import jakarta.persistence.EntityNotFoundException;
import org.madi.demo.dto.CreateReportDTO;
import org.madi.demo.dto.ReportDTO;
import org.madi.demo.dto.ResolveReportDTO;
import org.madi.demo.entities.Report;
import org.madi.demo.entities.User;
import org.madi.demo.repository.ReportRepository;
import org.madi.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

	private final ReportRepository reportRepository;
	private final UserRepository userRepository;
	private final AdminService adminService;

	public ReportService(ReportRepository reportRepository,
						 UserRepository userRepository,
						 AdminService adminService) {
		this.reportRepository = reportRepository;
		this.userRepository = userRepository;
		this.adminService = adminService;
	}

	@Transactional
	public ReportDTO createReport(CreateReportDTO dto, User reporter) {
		Report report = new Report();
		report.setType(dto.getType());
		report.setReporter(reporter);
		report.setTargetUsername(dto.getTargetUsername());
		report.setMessage(dto.getMessage());

		// Проверяем существование похожих жалоб
		List<Report> similarReports = reportRepository.findByTargetUsernameAndTypeAndStatus(
				dto.getTargetUsername(),
				dto.getType(),
				Report.ReportStatus.PENDING
		);

		if (!similarReports.isEmpty()) {
			// Увеличиваем счетчик существующей жалобы
			Report existing = similarReports.get(0);
			existing.setCount(existing.getCount() + 1);
			reportRepository.save(existing);
			return convertToDTO(existing);
		}

		report = reportRepository.save(report);
		return convertToDTO(report);
	}

	@Transactional(readOnly = true)
	public List<ReportDTO> getAllReports() {
		return reportRepository.findAll().stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Page<ReportDTO> getReports(Pageable pageable) {
		return reportRepository.findAll(pageable)
				.map(this::convertToDTO);
	}

	@Transactional(readOnly = true)
	public List<ReportDTO> getPendingReports() {
		return reportRepository.findByStatus(Report.ReportStatus.PENDING).stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
	}

	@Transactional
	public ReportDTO resolveReport(Long reportId, ResolveReportDTO dto, User resolvedBy) {
		Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new EntityNotFoundException("Report not found"));

		report.setStatus(Report.ReportStatus.RESOLVED);
		report.setResolvedAt(LocalDateTime.now());
		report.setResolvedBy(resolvedBy);
		report.setResolutionComment(dto.getResolutionComment());

		if (dto.isBanUser()) {
			User targetUser = userRepository.findByNickname(report.getTargetUsername());
			if (targetUser == null) {
				throw new EntityNotFoundException("Report not found");
			}
//					.orElseThrow(() -> new EntityNotFoundException("User not found"));
			adminService.banUser(targetUser.getId(), dto.getBanDurationMinutes(),
					"Banned due to report #" + reportId);
		}

		report = reportRepository.save(report);
		return convertToDTO(report);
	}

	@Transactional(readOnly = true)
	public ReportDTO getReportById(Long id) {
		return reportRepository.findById(id)
				.map(this::convertToDTO)
				.orElseThrow(() -> new EntityNotFoundException("Report not found"));
	}

	@Transactional(readOnly = true)
	public List<ReportDTO> getReportsByUser(String username) {
		return reportRepository.findByTargetUsername(username).stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
	}

	private ReportDTO convertToDTO(Report report) {
		ReportDTO dto = new ReportDTO();
		dto.setId(report.getId());
		dto.setType(report.getType());
		dto.setReporterUsername(report.getReporter().getNickname());
		dto.setTargetUsername(report.getTargetUsername());
		dto.setMessage(report.getMessage());
		dto.setCount(report.getCount());
		dto.setCreatedAt(report.getCreatedAt());
		dto.setStatus(report.getStatus().name());
		dto.setResolutionComment(report.getResolutionComment());
		return dto;
	}
}