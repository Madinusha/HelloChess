package org.madi.demo.service;

import lombok.Getter;
import org.madi.demo.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Map;

@Service
public class ChessService {

	@Autowired
	private GameSessionService sessionService;

	private final SimpMessagingTemplate messagingTemplate;

	@Getter
	private Chessboard chessboard = new Chessboard();

	public ChessService(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
		startNewGame();
	}

	public void startNewGame() {
		chessboard = new Chessboard();
	}

	public List<Position> getPossibleMoves(String sessionId, Position position) {
		GameSession session = sessionService.getSession(sessionId);
		return session.getChessboard().getValidMoves(position);
	}

	public Map<String, Object> makeMove(String sessionId, Position from, Position to) {
		GameSession session = sessionService.getSession(sessionId);
		var result = session.getChessboard().moveFigure(from, to);
		if (session.getChessboard().getMotionList().size() == 1) {
			session.getTimer().switchTurn();
		} else if (session.getChessboard().getMotionList().size() == 2){
			session.getTimer().switchTurn();
			session.getTimer().start();
		} else {
			session.getTimer().switchTurnWithIncrement();
		}

		return result;
	}

	public Map<String, Object> promotePawn(String sessionId, Position positionFrom, Position positionTo, String newPieceType) {
		GameSession session = sessionService.getSession(sessionId);
		return session.getChessboard().exchangePawn(positionFrom, positionTo, newPieceType);
	}
}

