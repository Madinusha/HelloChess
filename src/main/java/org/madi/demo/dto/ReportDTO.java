package org.madi.demo.dto;

import lombok.Data;
import org.madi.demo.entities.Report.ReportType;

import java.time.LocalDateTime;

@Data
public class ReportDTO {
	private Long id;
	private ReportType type;
	private String reporterUsername;
	private String targetUsername;
	private String message;
	private Integer count;
	private LocalDateTime createdAt;
	private String status;
	private String resolutionComment;
}

