package org.madi.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
public class King extends Piece{
	@JsonProperty("hasMoved")
	private boolean hasMoved = false;
	@JsonProperty("hasChecked")
	private boolean hasChecked = false;
	public King(String color) {
		super(color);
	}
	public King(String color, boolean hasMoved, boolean hasChecked) {
		super(color);
		if (hasMoved == true) {
			setHasMoved();
		}
		if (hasChecked == true) {
			setHasChecked();
		}
	}

	public void setHasMoved() {
		this.hasMoved = true;
	}
	public void setHasChecked() {
		this.hasChecked = true;
	}

	@Override
	public boolean isValidMove(Position from, Position to, Chessboard board) {
		int rowDifference = Math.abs(to.getRow() - from.getRow());
		int colDifference = Math.abs(to.getCol() - from.getCol());

		// Король может двигаться на одну клетку в любом направлении
		return (rowDifference <= 1 && colDifference <= 1);
	}
	@Override
	public String toString()
	{
		return (getColor().equals("white")) ? "♔" : "♚";
	}
}

