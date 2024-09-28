package org.madi.demo.service;

import org.madi.demo.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Map;

@Service
public class ChessService {

	private final SimpMessagingTemplate messagingTemplate;
	private Chessboard chessboard = new Chessboard();

	private static final Logger logger = LoggerFactory.getLogger(ChessService.class);

	public ChessService(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
		startNewGame();
	}

	private void initiatePromotion(Position position) {
		// Отправляем сообщение клиенту с позицией для промоушена
		messagingTemplate.convertAndSend("/topic/promotion", position);
	}

	public void startNewGame() {
		chessboard = new Chessboard();
	}

	public List<Position> getPossibleMoves(Position position) {
		return chessboard.getValidMoves(position);
	}

	public Map<String, Object> makeMove(Position fromPosition, Position toPosition) {
		// Выполняем ход и получаем результат
		Map<String, Object> result = chessboard.moveFigure(fromPosition, toPosition, chessboard);
		return result;
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




	public Chessboard getChessboard() {
		return chessboard;
	}
}

