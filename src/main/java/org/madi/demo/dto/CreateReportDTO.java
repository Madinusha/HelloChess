
package org.madi.demo.dto;

import lombok.Data;
import org.madi.demo.entities.Report.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateReportDTO {
	@NotNull
	private ReportType type;

	@NotBlank
	private String targetUsername;

	private String message;
}
