package org.madi.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Donut extends Piece {
	@JsonProperty("color")
	private String color = "pink";

	public Donut(String color) {
		super(color);
	}

	@Override
	public boolean isValidMove(Position from, Position to, Chessboard board) {
		return false;
	}

	@Override
	public String getShortName() {
		return "";
	}

	@Override
	public String toString()
	{
		return "o";
	}
}
