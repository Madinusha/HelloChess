package org.madi.demo.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.madi.demo.dto.*;
import org.madi.demo.entities.User;
import org.madi.demo.model.*;
import org.madi.demo.model.Position;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.GameSessionService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
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

	@Autowired
	private GameSessionService gameSessionService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private UserService userService;

	public ChessController(ChessService chessService) {
		this.chessService = chessService;
	}

	@GetMapping("/{sessionId}/status")
	public ResponseEntity<GameStatusDTO> getGameStatus(@PathVariable String sessionId, Principal principal) {
		GameSession gameSession = gameSessionService.getSession(sessionId);
		if (gameSession == null) {
			return ResponseEntity.notFound().build();
		}

		Chessboard chessboard = gameSession.getChessboard();

		String currentPlayerColor = gameSession.getCurrentPlayerColor();
		List<Map<String, Object>> moveHistory = gameSession.getChessboard().getMoveResults();
		List<MutablePair<Integer, Piece>> eatenPieces = gameSession.getChessboard().getEatenFigures();

		String whiteTime = gameSession.getTimer().getFormattedTime(true);
		String blackTime = gameSession.getTimer().getFormattedTime(false);
		Boolean timerActive =  gameSession.getTimer().isTimerActive();

		String gameStatus = gameSession.getStatus().name();

		User whiteUser = gameSession.getPlayerWhite();
		User blackUser = gameSession.getPlayerBlack();

		UserProfileDTO whitePlayer = new UserProfileDTO(whiteUser.getNickname(), whiteUser.getEmail(), whiteUser.getRating());
		UserProfileDTO blackPlayer = new UserProfileDTO(blackUser.getNickname(), blackUser.getEmail(), blackUser.getRating());

		Boolean promotionRequired = false; //session.isPromotionRequired();
		Position promotionPosition = new Position("e2"); //promotionRequired ? session.getPromotionPosition() : null;

		Boolean castlingPossible = false; //session.isCastlingPossible();
		Map<String, Position> castlingData = new HashMap<>(); //castlingPossible ? session.getCastlingData() : null;

		String gameResult = gameSession.getChessboard().getStatus();

		List<Pair<String, String>> chat = gameSession.getChat();
		List<ChatDTO> chatDTO = gameSession.getChat().stream()
				.map(pair -> new ChatDTO(pair.getLeft(), pair.getRight()))
				.toList();

		GameStatusDTO dto = new GameStatusDTO(
				chessboard,
				currentPlayerColor,
				moveHistory,
				eatenPieces,
				whiteTime,
				blackTime,
				timerActive,
				gameStatus,
				whitePlayer,
				blackPlayer,
				promotionRequired,
				promotionPosition,
				castlingPossible,
				castlingData,
				gameResult,
				chatDTO
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
		GameSession session = gameSessionService.getSession(sessionId);
		if (!session.isPlayersTurn(headerAccessor.getUser().getName())) {
			throw new AccessDeniedException("Сейчас не ваш ход!");
		}

		// 2. Обработка хода
		Map<String, Object> moveResult;
		System.out.println("move.getPromotionPiece() :" +  move.getPromotionPiece());
		if (move.getPromotionPiece() != null) {
			System.out.println("в сервисе пытаюсь делать промоушн");
			moveResult = chessService.promotePawn(
					sessionId,
					move.getFrom(),
					move.getTo(),
					move.getPromotionPiece());
		} else {
			moveResult = chessService.makeMove(
					sessionId,
					move.getFrom(),
					move.getTo()
			);
		}

		// 3. Рассылка обновления
		messagingTemplate.convertAndSend(
				"/topic/game/" + sessionId,
				Map.of(
						"type", "move",
						"moveResult", moveResult,
						"chessboard", session.getChessboard(),
						"currentPlayer", session.getCurrentPlayerColor()
				)
		);
		GameTimer timer = session.getTimer();
		if (!timer.isStopped()) {
			messagingTemplate.convertAndSend(
					"/topic/game/" + sessionId + "/timer",
					Map.of(
							"whiteTime", timer.getFormattedTime(true),
							"blackTime", timer.getFormattedTime(false),
							"timerActive", timer.isTimerActive()
					)
			);
		}
	}

	@MessageMapping("/{sessionId}/draw-suggestion")
	public void sendDrawSuggestion(@DestinationVariable String sessionId, Principal principal) {
		User user = userService.findUserByNickname(principal.getName());
		GameSession session = gameSessionService.getSession(sessionId);
		User opponent = session.getOpponentFor(user);

		messagingTemplate.convertAndSendToUser(
				user.getNickname(),
				"/queue/draw-suggestion-created",
				""
		);

		messagingTemplate.convertAndSendToUser(
				opponent.getNickname(),
				"/queue/draw-suggestion",
				""
		);
	}

	@MessageMapping("/{sessionId}/accept-draw-suggestion")
	public void acceptDrawSuggestion(@DestinationVariable String sessionId, Principal principal) {
		User user = userService.findUserByNickname(principal.getName());
		GameSession session = gameSessionService.getSession(sessionId);
		User opponent = session.getOpponentFor(user);
		chessService.endGame(sessionId, "DRAW");

		messagingTemplate.convertAndSendToUser(
				opponent.getNickname(),
				"/queue/draw-suggestion-accepted",
				""
		);

		messagingTemplate.convertAndSendToUser(
				user.getNickname(),
				"/queue/draw-suggestion-accepted",
				""
		);

		GameTimer timer = session.getTimer();
		messagingTemplate.convertAndSend(
				"/topic/game/" + sessionId + "/timer",
				Map.of(
						"whiteTime", timer.getFormattedTime(true),
						"blackTime", timer.getFormattedTime(false),
						"timerActive", timer.isTimerActive()
				)
		);
	}

	@MessageMapping("/{sessionId}/cancel-draw-suggestion")
	public void cancelDrawSuggestion(@DestinationVariable String sessionId, Principal principal) {
		User user = userService.findUserByNickname(principal.getName());
		GameSession session = gameSessionService.getSession(sessionId);
		User opponent = session.getOpponentFor(user);

		messagingTemplate.convertAndSendToUser(
				opponent.getNickname(),
				"/queue/cancel-draw-suggestion",
				""
		);
	}

	@MessageMapping("/{sessionId}/message")
	public void sendMessage(@DestinationVariable String sessionId, Principal principal, @RequestBody String message) {
		User user = userService.findUserByNickname(principal.getName());
		GameSession session = gameSessionService.getSession(sessionId);
		session.addMessage(user.getNickname(), message);

		messagingTemplate.convertAndSendToUser(
				session.getOpponentFor(user).getNickname(),
				"/queue/new-message",
				Map.of("message", message)
		);
	}

	@Setter
	@Getter
	@AllArgsConstructor
	public static class MoveRequest {
		private Position from;
		private Position to;
		private String promotionPiece;

	}
}
