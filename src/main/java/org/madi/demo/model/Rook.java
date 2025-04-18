package org.madi.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
public class Rook extends Piece { // Ладья
	@JsonProperty("hasMoved")
	private boolean hasMoved = false;
	public void setHasMoved() {
		this.hasMoved = true;
	}

	public Rook(String color) {
		super(color);
	}
	public Rook(String color, boolean hasMoved) {
		super(color);
		setHasMoved();
	}

	@Override
	public boolean isValidMove(Position from, Position to, Chessboard board) {
		// Реализация валидации хода для ладьи
		int rowDifference = Math.abs(to.getRow() - from.getRow());
		int colDifference = Math.abs(to.getCol() - from.getCol());

		// Ход допустим, если ладья двигается по горизонтали или вертикали
		if (rowDifference == 0 || colDifference == 0) {
			return !board.areFiguresBetween(from, to);
		}
		return false;
	}

	@Override
	public String toString()
	{
		return (getColor().equals("white")) ? "♖" : "♜";
	}

	@Override
	public String getShortName() {
		return "R";
	}
}
