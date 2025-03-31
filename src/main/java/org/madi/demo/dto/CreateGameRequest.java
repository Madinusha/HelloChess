package org.madi.demo.dto;

import lombok.Data;
import org.madi.demo.model.GameSession;

@Data
public class CreateGameRequest {
	private GameSession.PieceColor playerColor;
	private TimeControl timeControl;

	@Data
	public static class TimeControl {
		private int minutes;
		private int increment;
	}
}