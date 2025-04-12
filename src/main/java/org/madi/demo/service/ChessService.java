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
	private GameSessionService sessionManager;

	private final SimpMessagingTemplate messagingTemplate;

	@Getter
	private Chessboard chessboard = new Chessboard();

	private static final Logger logger = LoggerFactory.getLogger(ChessService.class);

	public ChessService(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
		startNewGame();
	}

//	private void initiatePromotion(Position position) {
//		messagingTemplate.convertAndSend("/topic/promotion", position);
//	}

	public void startNewGame() {
		chessboard = new Chessboard();
	}

	public List<Position> getPossibleMoves(String sessionId, Position position) {
		GameSession session = sessionManager.getSession(sessionId);
		return session.getChessboard().getValidMoves(position);
	}

	public Map<String, Object> makeMove(String sessionId, Position from, Position to) {
		GameSession session = sessionManager.getSession(sessionId);
		return session.getChessboard().moveFigure(from, to);
	}

	public Map<String, Object> promotePawn(String sessionId, Position positionFrom, Position positionTo, String newPieceType) {
		GameSession session = sessionManager.getSession(sessionId);
		return session.getChessboard().exchangePawn(positionFrom, positionTo, newPieceType);
	}
}

