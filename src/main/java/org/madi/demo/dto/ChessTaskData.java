package org.madi.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChessTaskData {
	private String initialFen;
	private List<String> solutionMoves;
	private String goal;
}
