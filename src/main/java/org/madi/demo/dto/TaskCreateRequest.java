package org.madi.demo.dto;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class TaskCreateRequest {
	private String description;
	@Valid
	private ChessTaskData chessData;
}