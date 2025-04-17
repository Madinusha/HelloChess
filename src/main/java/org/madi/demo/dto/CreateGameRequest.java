package org.madi.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.madi.demo.model.GameSession;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateGameRequest {
	private GameSession.PieceColor playerColor;
	private TimeControl timeControl;

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class TimeControl {
		private int minutes;
		private int increment;
	}
}