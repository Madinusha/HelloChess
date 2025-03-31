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

	private void initiatePromotion(Position position) {
		messagingTemplate.convertAndSend("/topic/promotion", position);
	}

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

	public Chessboard promotePawn(Position position, String newPieceType) {
		Piece pawn = chessboard.getFigureAt(position);
		logger.info("newPieceType: " + newPieceType);
		if (pawn instanceof Pawn) {
			Piece newPiece = null;
			switch (newPieceType) {
				case "Queen":
					newPiece = new Queen(pawn.getColor());
					break;
				case "Rook":
					newPiece = new Rook(pawn.getColor());
					break;
				case "Bishop":
					newPiece = new Bishop(pawn.getColor());
					break;
				case "Knight":
					newPiece = new Knight(pawn.getColor());
					break;
			}
			if (newPiece != null) {
				chessboard.placeFigure(newPiece, position);
				logger.info(String.valueOf(chessboard));
			}
		}
		return chessboard;
	}
}

