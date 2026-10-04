
package org.madi.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.madi.demo.enums.ReportType;

@Data
public class CreateReportDTO {
	@NotNull
	private ReportType type;

	@NotBlank
	private String targetUsername;

	private String message;
}
