package org.madi.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
public class Position {

	@JsonProperty("col")
	private char col;
	@JsonProperty("row")
	private int row;

	public Position(int col, int row) {
		this.row = row;
		this.col = (char)('a' + col - 1);
	}
	public Position(String pos) {
		col = pos.charAt(0);
		row = Character.getNumericValue(pos.charAt(1));
	}

	public int getColAsNumber() {
		return col - 'a' + 1;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null || getClass() != obj.getClass()) return false;
		Position position = (Position) obj;
		return row == position.row && col == position.col;
	}

	@Override
	public int hashCode() {
		return Objects.hash(row, col);
	}

	@Override
	public String toString() {
		return col + "" + row;
	}
}
