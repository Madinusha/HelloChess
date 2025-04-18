package org.madi.demo.service;

import lombok.Getter;
import org.madi.demo.entities.GameHistory;
import org.madi.demo.model.*;
import org.madi.demo.repository.GameHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ChessService {
	private final GameSessionService gameSessionService;
	private final SimpMessagingTemplate messagingTemplate;
	private final GameHistoryRepository gameHistoryRepository;
	@Getter
	private Chessboard chessboard = new Chessboard();

	@Autowired
	public ChessService(
			GameSessionService gameSessionService,
			SimpMessagingTemplate messagingTemplate,
			GameHistoryRepository gameHistoryRepository
	) {
		this.gameSessionService = gameSessionService;
		this.messagingTemplate = messagingTemplate;
		this.gameHistoryRepository = gameHistoryRepository;
		startNewGame();
	}

	public void startNewGame() {
		chessboard = new Chessboard();
	}

	public List<Position> getPossibleMoves(String sessionId, Position position) {
		GameSession session = gameSessionService.getSession(sessionId);
		return session.getChessboard().getValidMoves(position);
	}

	public Map<String, Object> makeMove(String sessionId, Position from, Position to) {
		GameSession session = gameSessionService.getSession(sessionId);
		var result = session.getChessboard().moveFigure(from, to);
		if (session.getChessboard().getMotionList().size() == 1) {
			session.getTimer().switchTurn();
		} else if (session.getChessboard().getMotionList().size() == 2){
			session.getTimer().switchTurn();
			session.getTimer().start();
		} else {
			session.getTimer().switchTurnWithIncrement();
		}
		if (result.containsKey("draw") || result.containsKey("victory")) {
			session.getTimer().stop();
			System.out.println("Игра окончена");
			session.setStatus(GameSession.GameStatus.FINISHED);
			session.setEndTime(LocalDateTime.now());
			endGame(sessionId);
		}

		return result;
	}
	public void endGame(String sessionId, String winner) {
		GameSession session = gameSessionService.getSession(sessionId);
		session.getChessboard().setStatus(winner);
		session.setStatus(GameSession.GameStatus.FINISHED);
		session.setEndTime(LocalDateTime.now());
		endGame(sessionId);
	}
	public void endGame(String sessionId) {
		GameSession session = gameSessionService.getSession(sessionId);

		if (session.getPlayerWhite() == null || session.getPlayerBlack() == null) {
			System.out.println("белый и черный игроки: " + session.getPlayerWhite() + " " + session.getPlayerBlack());
			throw new IllegalStateException("Нельзя сохранить игру без обоих игроков");
		}
		GameHistory history = new GameHistory();
		history.setWhitePlayer(session.getPlayerWhite());
		history.setBlackPlayer(session.getPlayerBlack());
		history.setResult(session.getChessboard().getStatus());
		history.setInitialTimeMinutes(session.getTimer().getInitialTimeMinutes());
		history.setInitialTimeIncrement(session.getTimer().getIncrementSeconds());
		history.setStartTime(session.getStartTime());
		history.setEndTime(session.getEndTime());
		history.setPGN(session.getChessboard().getPGN());

		gameHistoryRepository.save(history);
	}

	public Map<String, Object> promotePawn(String sessionId, Position positionFrom, Position positionTo, String newPieceType) {
		GameSession session = gameSessionService.getSession(sessionId);
		return session.getChessboard().exchangePawn(positionFrom, positionTo, newPieceType);
	}
}

