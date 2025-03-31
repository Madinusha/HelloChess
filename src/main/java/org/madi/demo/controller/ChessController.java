package org.madi.demo.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.madi.demo.dto.CreateGameRequest;
import org.madi.demo.entities.User;
import org.madi.demo.model.*;
import org.madi.demo.model.Position;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.GameSessionService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/chess")
public class ChessController {

	private final ChessService chessService;

	public ChessController(ChessService chessService) {
		this.chessService = chessService;
	}

	@Autowired
	private GameSessionService sessionManager;

	@Autowired
	private UserService userService;

	@GetMapping("/possible-moves")
	public ResponseEntity<List<Position>> getPossibleMoves(
			@RequestParam String sessionId,
			@RequestParam Position position
	) {
		List<Position> possibleMoves = chessService.getPossibleMoves(sessionId, position);
		return ResponseEntity.ok(possibleMoves);
	}

	@PostMapping("/make-move")
	public ResponseEntity<Map<String, Object>> makeMove(
			@RequestBody MoveRequest moveRequest,
			@RequestParam String sessionId
	) {
		Map<String, Object> result = chessService.makeMove(sessionId, moveRequest.from, moveRequest.to);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/chessboard")
	public ResponseEntity<Chessboard> getChessboard() {
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
