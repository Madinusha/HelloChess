package org.madi.demo.controller;

import org.madi.demo.dto.CreateGameRequest;
import org.madi.demo.entities.User;
import org.madi.demo.model.GameSession;
import org.madi.demo.model.GameTimer;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.GameSessionService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.madi.demo.model.GameSession.GameStatus.WAITING;

@RestController
@RequestMapping("/api")
public class GameConstructorController {
	@Autowired
	private GameSessionService sessionService;

	@Autowired
	private ChessService chessService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private UserService userService;

	@MessageMapping("/game/create")
	public void handleGameCreation(
			@Payload CreateGameRequest request,
			Principal principal
	) {
		User creator = userService.findUserByNickname(principal.getName());
		String sessionId = UUID.randomUUID().toString();

		// Создаем сессию с таймером
		GameSession session = sessionService.createSession(
				sessionId,
				creator,
				request.getPlayerColor(),
				new GameTimer(request.getTimeControl().getMinutes(), request.getTimeControl().getIncrement())
		);
		System.out.println(request.getTimeControl().getMinutes());

		// Отправляем ответ создателю
		messagingTemplate.convertAndSendToUser(
				principal.getName(),
				"/queue/game-created",
				Map.of("sessionId", sessionId)
		);

		// Рассылаем обновление о созданной игре всем пользователям
		messagingTemplate.convertAndSend(
				"/topic/games/available",
				Map.of(
						"nickname", creator.getNickname(),
						"rating", 100,
						"time", String.format("%d + %d",
								request.getTimeControl().getMinutes(),
								request.getTimeControl().getIncrement()
						),
						"sessionId", sessionId
				)
		);
	}

	@MessageMapping("/game/{sessionId}/join")
	public void handleJoinGame(
			@DestinationVariable String sessionId,
			Principal principal
	) {
		GameSession session = sessionService.getSession(sessionId);
		User joiningUser = userService.findUserByNickname(principal.getName());
		if (session.getStatus() == WAITING) {
			try {
				session.joinPlayer(joiningUser);
				User creator = session.getCreator();
				// Уведомление для создателя
				messagingTemplate.convertAndSendToUser(
						creator.getNickname(),
						"/queue/game-start",
						Map.of("sessionId", sessionId)
				);
				System.out.println("Типа отправил создателю");
				// Общее уведомление для всех участников
				messagingTemplate.convertAndSend(
						"/topic/game/" + sessionId,
						Map.of("status", "ACTIVE")
				);
			} catch (IllegalStateException e) {
				messagingTemplate.convertAndSendToUser(
						principal.getName(),
						"/queue/errors",
						Map.of("error", e.getMessage())
				);
			}
		}
	}

	@GetMapping("/games/available")
	public List<Map<String, Object>> getAvailableGames() {
		return sessionService.getAvailableGames();
	}

	public void endGame(String sessionId) {
		sessionService.removeSession(sessionId);
		messagingTemplate.convertAndSend(
				"/topic/games/closed",
				Map.of("sessionId", sessionId)
		);
	}

	private void sendPlayerColors(GameSession session, User joiningUser) {
		if (session.getPlayerWhite() == null || session.getPlayerBlack() == null) {
			throw new IllegalStateException("Игроки не найдены");
		}

		// Отправляем цвета
		messagingTemplate.convertAndSendToUser(
				session.getPlayerWhite().getNickname(),
				"/queue/player-color",
				Map.of("color", "WHITE")
		);

		messagingTemplate.convertAndSendToUser(
				session.getPlayerBlack().getNickname(),
				"/queue/player-color",
				Map.of("color", "BLACK")
		);
	}

	@MessageExceptionHandler
	public void handleException(Exception ex, Principal principal) {
		messagingTemplate.convertAndSendToUser(
				principal.getName(),
				"/queue/errors",
				Map.of("error", ex.getMessage())
		);
	}
}