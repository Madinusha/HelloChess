package org.madi.demo.controller;

import org.madi.demo.dto.CreateGameRequest;
import org.madi.demo.entities.User;
import org.madi.demo.model.GameSession;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.GameSessionService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.madi.demo.model.GameSession.GameStatus.REQUEST;
import static org.madi.demo.model.GameSession.GameStatus.WAITING;

@RestController
@RequestMapping("/api")
public class GameConstructorController {
	@Autowired
	private GameSessionService gameSessionService;

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
		GameSession session = gameSessionService.createSession(
				sessionId,
				creator,
				request.getPlayerColor(),
				request.getTimeControl().getMinutes(),
				request.getTimeControl().getIncrement()
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
						"rating", creator.getRating(),
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
		GameSession session = gameSessionService.getSession(sessionId);
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
				// Общее уведомление для всех участников
				messagingTemplate.convertAndSend(
						"/topic/game/" + sessionId,
						Map.of("status", "ACTIVE")
				);
				messagingTemplate.convertAndSendToUser(
						session.getOpponentFor(creator).getNickname(),
						"/queue/game-joined",
						Map.of("sessionId", sessionId)
				);
				closeGame(sessionId);
			} catch (IllegalStateException e) {
				messagingTemplate.convertAndSendToUser(
						principal.getName(),
						"/queue/errors",
						Map.of("error", e.getMessage())
				);
			}
		}
	}

	@MessageMapping("/game/{sessionId}/initial-params")
	public void handleGameInitialParams(
			@DestinationVariable String sessionId,
			Principal principal
	) {
		GameSession session = gameSessionService.getSession(sessionId);
		User user = userService.findUserByNickname(principal.getName());

		CreateGameRequest gameRequest = new CreateGameRequest(
				session.getInitialColor(),
				new CreateGameRequest.TimeControl(
						session.getTimer().getInitialTimeMinutes(),
						session.getTimer().getIncrementSeconds()
				)
		);
		// Отправка клиенту
		messagingTemplate.convertAndSendToUser(
				user.getNickname(),
				"/queue/initial-params",
				gameRequest
		);
	}

	@GetMapping("/games/available")
	public List<Map<String, Object>> getAvailableGames() {
		return gameSessionService.getAvailableGames();
	}

	public void closeGame(String sessionId) {
		messagingTemplate.convertAndSend(
				"/topic/games/closed",
				Map.of("sessionId", sessionId)
		);
	}

	@MessageMapping("/game/{sessionId}/cancel-creation")
	public void cancelGameCreation(
			@DestinationVariable String sessionId,
			Principal principal
	) {
		GameSession session = gameSessionService.getSession(sessionId);
		User user = userService.findUserByNickname(principal.getName());

		gameSessionService.removeSession(sessionId);
		messagingTemplate.convertAndSend(
				"/topic/game/" + sessionId + "/closed",
				Map.of("sessionId", sessionId)
		);
	}

	@MessageMapping("/game/{sessionId}/retry")
	public void handleRetryRequest(@DestinationVariable String sessionId,
								   @Payload CreateGameRequest request,
								   Principal principal)
	{
		User creator = userService.findUserByNickname(principal.getName());
		GameSession session = gameSessionService.getSession(sessionId);

		String newSessionId = UUID.randomUUID().toString();
		// Создаем новую сессию
		GameSession newSession = gameSessionService.createSession(
				newSessionId,
				creator,
				request.getPlayerColor(),
				request.getTimeControl().getMinutes(),
				request.getTimeControl().getIncrement()
		);
		newSession.setStatus(REQUEST);

		// Отправляем ответ создателю
		messagingTemplate.convertAndSendToUser(
				creator.getNickname(),
				"/queue/game-created",
				Map.of("sessionId", newSessionId)
		);

		// Отправляем обновление о предложении реванша
		messagingTemplate.convertAndSendToUser(
				session.getOpponentFor(creator).getNickname(),
				"/queue/retry",
				Map.of(
						"nickname", creator.getNickname(),
						"rating", creator.getRating(),
						"time", String.format("%d + %d",
								request.getTimeControl().getMinutes(),
								request.getTimeControl().getIncrement()
						),
						"sessionId", newSessionId
				)
		);
	}

	@MessageMapping("/game/{sessionId}/retry-join")
	public void handleJoinRetryGame(
			@DestinationVariable String sessionId,
			Principal principal
	) {
		GameSession session = gameSessionService.getSession(sessionId);
		User joiningUser = userService.findUserByNickname(principal.getName());
		System.out.println("статус: " + session.getStatus());
		if (session.getStatus() == REQUEST) {
			try {
				session.joinPlayer(joiningUser);
				User creator = session.getCreator();
				System.out.println("creator: " + creator.getNickname());
				System.out.println("joiningUser: " + joiningUser.getNickname());
				// Уведомление для создателя
				messagingTemplate.convertAndSendToUser(
						creator.getNickname(),
						"/queue/game-start",
						Map.of("sessionId", sessionId)
				);
				messagingTemplate.convertAndSendToUser(
						session.getOpponentFor(creator).getNickname(),
						"/queue/game-joined",
						Map.of("sessionId", sessionId)
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