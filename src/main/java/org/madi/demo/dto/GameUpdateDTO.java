package org.madi.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.madi.demo.controller.ChessController;
import org.madi.demo.model.Chessboard;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class GameUpdateDTO {
	private Map<String, Object> moveResult;
//	private Chessboard chessboard;
	private ChessController.MoveRequest lastMove;       // Последний ход (например, "e2-e4")
	private String currentPlayer = "WHITE"; 	// Текущий игрок ("WHITE" или "BLACK")
}