package org.madi.demo.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.tuple.MutablePair;
import org.madi.demo.dto.CreateGameRequest;
import org.madi.demo.dto.GameStatusDTO;
import org.madi.demo.dto.GameUpdateDTO;
import org.madi.demo.entities.User;
import org.madi.demo.model.*;
import org.madi.demo.model.Position;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.GameSessionService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/game")
public class ChessController {

	private final ChessService chessService;
	public ChessController(ChessService chessService) {
		this.chessService = chessService;
	}

	@Autowired
	private GameSessionService sessionService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private UserService userService;

	@GetMapping("/{sessionId}/status")
	public ResponseEntity<GameStatusDTO> getGameStatus(@PathVariable String sessionId, Principal principal) {
		GameSession gameSession = sessionService.getSession(sessionId);
		if (gameSession == null) {
			return ResponseEntity.notFound().build();
		}

		Chessboard chessboard = gameSession.getChessboard();

		String currentPlayerColor = gameSession.getCurrentPlayerColor();
		List<MoveRequest> moveHistory = new ArrayList<>();

		String whiteTime = gameSession.getTimer().getFormattedTime(true);
		String blackTime = gameSession.getTimer().getFormattedTime(false);

		String gameStatus = gameSession.getStatus().name();

		String whitePlayer = gameSession.getPlayerWhite().getNickname();
		String blackPlayer = gameSession.getPlayerBlack().getNickname();

		Boolean promotionRequired = false; //session.isPromotionRequired();
		Position promotionPosition = new Position("e2"); //promotionRequired ? session.getPromotionPosition() : null;

		Boolean castlingPossible = false; //session.isCastlingPossible();
		Map<String, Position> castlingData = new HashMap<>(); //castlingPossible ? session.getCastlingData() : null;

		String gameResult = "";
//		GameResultDTO gameResult = session.getGameResult();

		GameStatusDTO dto = new GameStatusDTO(
				chessboard,
				currentPlayerColor,
				moveHistory,
				whiteTime,
				blackTime,
				gameStatus,
				whitePlayer,
				blackPlayer,
				promotionRequired,
				promotionPosition,
				castlingPossible,
				castlingData,
				gameResult
		);
		return ResponseEntity.ok(dto);
	}

	@MessageMapping("/{sessionId}/possible-moves")
	@SendToUser("/queue/possible-moves")
	public Map<String, Object> getPossibleMoves( @DestinationVariable String sessionId, @RequestBody Position position) {
		List<Position> possibleMoves = chessService.getPossibleMoves(sessionId, position);
		return Map.of(
				"type", "possible-moves",
				"position", position,
				"possibleMoves", possibleMoves
		);
	}

	@MessageMapping("/{sessionId}/move")
	public void handleMove(
			@DestinationVariable String sessionId,
			@RequestBody ChessController.MoveRequest move,
			SimpMessageHeaderAccessor headerAccessor
	) {
		// 1. Проверка прав
		GameSession session = sessionService.getSession(sessionId);
		if (!session.isPlayersTurn(headerAccessor.getUser().getName())) {
			throw new AccessDeniedException("Сейчас не ваш ход!");
		}

		// 2. Обработка хода
		Map<String, Object> moveResult = chessService.makeMove(
				sessionId,
				move.getFrom(),
				move.getTo()
		);

		// 3. Рассылка обновления
		messagingTemplate.convertAndSend(
				"/topic/game/" + sessionId,
				Map.of(
						"type", "move",
						"moveResult", moveResult,
						"chessboard", session.getChessboard(),
						"move", move,
						"currentPlayer", session.getCurrentPlayerColor()
				)
		);
		GameTimer timer = session.getTimer();
		messagingTemplate.convertAndSend(
				"/topic/game/timer" + sessionId,
				Map.of(
						"whiteTime", timer.getFormattedTime(true),
						"blackTime", timer.getFormattedTime(false)
				)
		);
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
