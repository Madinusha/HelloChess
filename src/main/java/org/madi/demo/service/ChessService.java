package org.madi.demo.service;

import org.madi.demo.model.*;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Map;

@Service
public class ChessService {

	private final SimpMessagingTemplate messagingTemplate;
	private Chessboard chessboard = new Chessboard();

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

		// Проверяем, требуется ли промоушен
		if (result.containsKey("promotePawn")) {
			Position promotionPosition = (Position) result.get("promotePawn");
			initiatePromotion(promotionPosition); // Отправляем сообщение клиенту с позицией для промоушена
		}

		// Добавляем актуальное состояние доски в результат
		result.put("chessboard", chessboard);

		return result;
	}

	public Chessboard promotePawn(Position position, String newPieceType) {
		Piece pawn = chessboard.getFigureAt(position);
		if (pawn instanceof Pawn) {
			Piece newPiece = null;
			switch (newPieceType.toLowerCase()) {
				case "queen":
					newPiece = new Queen(pawn.getColor());
					break;
				case "rook":
					newPiece = new Rook(pawn.getColor());
					break;
				case "bishop":
					newPiece = new Bishop(pawn.getColor());
					break;
				case "knight":
					newPiece = new Knight(pawn.getColor());
					break;
			}
			if (newPiece != null) {
				chessboard.placeFigure(newPiece, position);
			}
		}
		return chessboard;
	}




	public Chessboard getChessboard() {
		return chessboard;
	}
}

