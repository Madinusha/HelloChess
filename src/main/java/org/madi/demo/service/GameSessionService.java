package org.madi.demo.service;

import org.madi.demo.entities.User;
import org.madi.demo.model.GameSession;
import org.madi.demo.model.GameTimer;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.madi.demo.model.GameSession.GameStatus.WAITING;

@Service
public class GameSessionService {
	private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

	public GameSession createSession(
			String sessionId,
			User creator,
			GameSession.PieceColor color,
			GameTimer timer
	) {
		GameSession session = new GameSession(
				sessionId,
				creator,
				color,
				timer
		);
		sessions.put(sessionId, session);
		System.out.println("Вот такой искомый sessionId - " + sessionId);
		return session;
	}

	public GameSession getSession(String sessionId) {
		return sessions.get(sessionId);
	}

	public void removeSession(String sessionId) {
		System.out.println("Удаляется сессия по id");
		sessions.remove(sessionId);
	}

	public List<Map<String, Object>> getAvailableGames() {
		return sessions.values().stream()
				.filter(session -> session.getStatus() == WAITING)
				.map(GameSession::toDto)
				.toList();
	}
}