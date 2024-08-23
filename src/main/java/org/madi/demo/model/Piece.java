package org.madi.demo.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
public abstract class Piece {

	private String color; // Цвет фигуры ("white" или "black")


	public String getFileName() {
		return (getClass().getSimpleName());
	}

	public abstract boolean isValidMove(Position from, Position to, Chessboard board);
}
