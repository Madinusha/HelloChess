package org.madi.demo.model;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.tuple.MutablePair;
import org.madi.demo.entities.User;
import java.util.*;

@Getter
@Setter
public class GameSession {
	private String id;
	private User playerWhite;
	private User playerBlack;
	private Chessboard chessboard;
	private GameTimer timer;
	private GameStatus status;
	private PieceColor creatorColor;
	private User creator;

	public GameSession(String id, User creator, PieceColor creatorColor, GameTimer timer) {
		this.id = id;
		this.creator = creator;
		this.creatorColor = resolveCreatorColor(creatorColor);
		assignPlayers(creator, this.creatorColor);
		this.timer = timer;
		this.chessboard = new Chessboard();
		this.status = GameStatus.WAITING;
	}

	public boolean isPlayersTurn(String username) {
		if (chessboard.getCurrentPlayerColor().equals("WHITE")) {
			return playerWhite != null &&
					playerWhite.getNickname().equals(username);
		} else {
			return playerBlack != null &&
					playerBlack.getNickname().equals(username);
		}
	}

	public String getCurrentPlayerColor() {
		return chessboard.getCurrentPlayerColor().equals("WHITE") ?
				"WHITE" : "BLACK";
	}

	public List<MutablePair<Position, Position>> getMoveHistory() {
		return chessboard.getMotionList();
	}

	private PieceColor resolveCreatorColor(PieceColor chosenColor) {
		if (chosenColor == PieceColor.RANDOM) {
			return new Random().nextBoolean() ? PieceColor.WHITE : PieceColor.BLACK;
		}
		return chosenColor;
	}

	private void assignPlayers(User creator, PieceColor color) {
		if (color == PieceColor.WHITE) {
			this.playerWhite = creator;
		} else {
			this.playerBlack = creator;
		}
	}

	public void joinPlayer(User joiningUser) {
		if (creatorColor == PieceColor.WHITE) {
			this.playerBlack = joiningUser;
		} else {
			this.playerWhite = joiningUser;
		}
		startGame();
	}

	public void startGame() {
		this.status = GameStatus.ACTIVE;
		timer.start(); // Запускаем таймер при старте игры
	}

	public int getTimeControlMinutes() {
		return timer.getInitialTimeMinutes();
	}

	public int getTimeControlIncrement() {
		return timer.getIncrementSeconds();
	}

	public enum GameStatus {
		WAITING, // Ожидание второго игрока
		ACTIVE,  // Игра началась
		FINISHED  // Игра завершена
	}

	public enum PieceColor {
		WHITE, BLACK, RANDOM;

		public PieceColor opposite() {
			return this == WHITE ? BLACK : WHITE;
		}
	}
	public Map<String, Object> toDto() {
		return Map.of(
				"nickname", creator.getNickname(),
				"rating", 100,
				"time", String.format("%d + %d", getTimeControlMinutes(), getTimeControlIncrement()),
				"sessionId", getId()
		);
	}
}