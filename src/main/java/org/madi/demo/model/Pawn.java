package org.madi.demo.model;

import org.apache.commons.lang3.tuple.MutablePair;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Pawn extends Piece {
	public Pawn(String color) {
		super(color);
	}

	@JsonProperty("hasMoved")
	private boolean hasMoved = false;

	public void setHasMoved() {
		this.hasMoved = true;
	}

	@Override
	public boolean isValidMove(Position from, Position to, Chessboard board) {
		int direction = getColor().equals("white") ? 1 : -1;

		int rowDifference = to.getRow() - from.getRow();
		int colDifference = Math.abs(to.getCol() - from.getCol());

		// Пешка может двигаться вперед на одну клетку
		if (colDifference == 0 && rowDifference == direction) {
			if (board.getFigureAt(to) == null) {
				return true;
			}
		} else if (!hasMoved && colDifference == 0 && rowDifference == 2 * direction) {
			// Пешка может двигаться на две клетки при первом ходе
			if (board.getFigureAt(to) == null && board.getFigureAt(new Position(from.getRow() + direction, from.getCol())) == null
					&& !board.areFiguresBetween(from, to)) {
				return true;
			}
		}

		// Пешка может бить фигуры по диагонали
		if (colDifference == 1 && rowDifference == direction) {
			if (canCaptureEnPassant(from, to, board)) {
				return true;
			}
			Piece targetFigure = board.getFigureAt(to);
			if (targetFigure != null && !targetFigure.getColor().equals(getColor())) {
				return true;
			}
		}

		return false;
	}

	public boolean canCaptureEnPassant(Position from, Position to, Chessboard board) {
		if (board.getMotionList().size() != 0) {
			Piece movingPawn = board.getFigureAt(from);

			// Получаем последний совершенный ход
			MutablePair<Position, Position> lastMove = board.getMotionList().get(board.getMotionList().size() - 1);
			Position fromLastMove = lastMove.getKey();
			Position toLastMove = lastMove.getValue();
			if (board.getFigureAt(toLastMove) instanceof Pawn) {
				// Проверяем, двигалась ли последняя пешка на две клетки вперед
				if (Math.abs(fromLastMove.getRow() - toLastMove.getRow()) == 2) {
					// Проверяем, находится ли последняя пешка на той же горизонтали, что и текущая пешка,
					// и что сейчас совершается ход на пустую клетку
					if (from.getRow() == toLastMove.getRow() &&
							Math.abs(to.getColAsNumber() - toLastMove.getColAsNumber()) == 0 &&
							!movingPawn.getColor().equals(board.getFigureAt(toLastMove).getColor()))
					{
						if (Math.abs(from.getRow() - to.getRow()) == 1) {
							return true;
						}
					}
				}
				return false;
			}
		}
		return false;
	}

	@Override
	public String toString()
	{
		return (getColor().equals("white")) ? "♙" : "♟";
	}

}
