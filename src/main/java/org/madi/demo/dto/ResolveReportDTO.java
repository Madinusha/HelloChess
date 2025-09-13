package org.madi.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolveReportDTO {
	@NotBlank
	private String resolutionComment;

	private boolean banUser;
	private Integer banDurationMinutes;
}