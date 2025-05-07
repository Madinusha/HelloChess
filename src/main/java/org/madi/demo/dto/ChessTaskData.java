package org.madi.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.tuple.MutablePair;
import org.madi.demo.model.Piece;
import org.madi.demo.model.Position;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ChessTaskData {
	private Map<String, Object> initialFen;
	private List<String> solutionMoves;
}
