package org.madi.demo.service;

import org.madi.demo.model.*;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ChessService {

	private Chessboard chessboard = new Chessboard();

	public ChessService() {
		startNewGame();
	}

	public void startNewGame() {
		chessboard = new Chessboard();
	}

	public List<Position> getPossibleMoves(Position position) {
		return chessboard.getValidMoves(position);
	}

	public Chessboard makeMove(Position fromPosition, Position toPosition) {
		chessboard.moveFigure(fromPosition, toPosition);
		return chessboard;
	}

	public Chessboard getChessboard() {
		return chessboard;
	}
}

