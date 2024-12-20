package org.madi.demo.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.madi.demo.model.*;
import org.madi.demo.model.Position;
import org.madi.demo.service.ChessService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/chess")
public class ChessController {

	private final ChessService chessService;

	public ChessController(ChessService chessService) {
		this.chessService = chessService;
	}

	@GetMapping("/possible-moves")
	public ResponseEntity<List<Position>> getPossibleMoves(@RequestParam Position position) {
		List<Position> possibleMoves = chessService.getPossibleMoves(position);
		return ResponseEntity.ok(possibleMoves);
	}

	@PostMapping("/make-move")
	public ResponseEntity<Map<String, Object>> makeMove(@RequestBody MoveRequest moveRequest) {
		Map<String, Object> result = chessService.makeMove(moveRequest.from, moveRequest.to);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/chessboard")
	public ResponseEntity<Chessboard> getChessboard() {
		// Chessboard chessboard = chessService.getChessboard();
		// return ResponseEntity.ok(chessboard);

		chessService.startNewGame();
		Chessboard chessboard = chessService.getChessboard();
		return ResponseEntity.ok(chessboard);
	}

	@PostMapping("/promotion")
	public ResponseEntity<Chessboard> promotePawn(@RequestBody PromotionRequest request) {
		Position position = request.position;
		String newPieceType = request.newPieceType;
		System.out.println("position: " +  position);
		System.out.println("newPieceType: " +  newPieceType);
		Chessboard chessboard = chessService.promotePawn(position, newPieceType);
		return ResponseEntity.ok(chessboard);
	}

	@Setter
	@Getter
	@AllArgsConstructor
	public static class MoveRequest {
		private Position from;
		private Position to;

	}

	@Setter
	@Getter
	@AllArgsConstructor
	public static class PromotionRequest {
		private Position position;
		private String newPieceType;

	}

}
