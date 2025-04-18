package org.madi.demo.model;

import lombok.experimental.SuperBuilder;

public class Queen extends Piece {

	public Queen(String color) {
		super(color);
	}
	@Override
	public boolean isValidMove(Position from, Position to, Chessboard board) {
		// Реализация валидации хода для ферзя
		int rowDifference = Math.abs(to.getRow() - from.getRow());
		int colDifference = Math.abs(to.getCol() - from.getCol());

		// Ход допустим, если ферзь двигается по горизонтали, вертикали или диагонали
		if (rowDifference == 0 || colDifference == 0 || rowDifference == colDifference){
			return !board.areFiguresBetween(from, to);
		}
		return false;
	}
	@Override
	public String toString()
	{
		return (getColor().equals("white")) ? "♕" : "♛";
	}

	@Override
	public String getShortName() {
		return "Q";
	}
}
