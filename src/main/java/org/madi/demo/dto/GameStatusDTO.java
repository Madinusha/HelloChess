package org.madi.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.madi.demo.controller.ChessController;
import org.madi.demo.model.Chessboard;
import org.madi.demo.model.Piece;
import org.madi.demo.model.Position;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class GameStatusDTO {
	private Chessboard chessboard; // Текущее состояние доски
	private String currentPlayerColor; // Цвет игрока, который должен ходить
	private List<Map<String, Object>> moveHistory; // История ходов
	private List<MutablePair<Integer, Piece>> eatenPieces;
	private String whiteTime;
	private String blackTime;
	private Boolean timerActive;
	private String gameStatus; // Статус игры (WAITING, ACTIVE, FINISHED)
	private UserProfileDTO whitePlayerDTO;
	private UserProfileDTO blackPlayerDTO;
	private Boolean promotionRequired; // Требуется ли промоушен
	private Position promotionPosition; // Позиция пешки для промоушена
	private Boolean castlingPossible; // Возможна ли рокировка
	private Map<String, Position> castlingData; // Данные для рокировки
	private String gameResult; // Результат игры (если она завершена)
	private List<ChatDTO> chatDTO;
}