package org.madi.demo.dto;

import lombok.Data;

@Data
public class TaskDTO {
	private Long id;
	private String description;
	private int order;
	private ChessTaskData chessData;
}
