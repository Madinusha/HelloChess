package org.madi.demo.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.tuple.MutablePair;
import org.madi.demo.controller.ChessController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
public class Chessboard {
	private Map<Position, Piece> board;
	private List<MutablePair<Integer, Piece>> eatenFigures;
	private List<MutablePair<Position, Position>> motionList;
	private String currentPlayerColor = "WHITE";  // "WHITE" или "BLACK"
	private String status; // "IN_PROGRESS", "CHECKMATE", "STALEMATE", "DRAW", etc.

	public Chessboard(Map<Position, Piece> board) {
		this.board = new HashMap<>(board);
		this.motionList = new ArrayList<>();
		this.eatenFigures = new ArrayList<>();
		initialize();
	}

	public Chessboard() {
		this.board = new HashMap<>();
		this.motionList = new ArrayList<>();
		this.eatenFigures = new ArrayList<>();
		initialize();
	}

	public Map<Position, Piece> getChessboard() {
		return board;
	}
	public void initialize() {
		// Очистить доску перед началом новой игры
		board.clear();

		// Расставить белые фигуры
		placeInitialPieces("white");

		// Расставить черные фигуры
		placeInitialPieces("black");
	}

	public Chessboard(List<Piece> figures, List<Position> positions) {
		if (figures.size() != positions.size()) {
			throw new IllegalArgumentException("Количество фигур должно быть равно количеству позиций.");
		}

		board = new HashMap<>();

		for (int i = 0; i < figures.size(); i++) {
			Piece Piece = figures.get(i);
			Position position = positions.get(i);
			placeFigure(Piece, position);
		}
	}
	public Chessboard(Chessboard newBoard)
	{	board = newBoard.getChessboard();
		motionList = newBoard.getMotionList();
		eatenFigures = newBoard.getEatenFigures();
		initialize();
	}

	public Chessboard copyChessboard(Chessboard originalBoard) {
		Chessboard copiedBoard = new Chessboard();

		// Проходимся по каждой клетке на доске
		for (Map.Entry<Position, Piece> entry : originalBoard.getChessboard().entrySet()) {
			Position position = entry.getKey();
			Piece originalFigure = entry.getValue();

			// Создаем новый объект фигуры и добавляем его на клетку в новой доске
			Piece copiedFigure = createCopyOfFigure(originalFigure);
			copiedBoard.getChessboard().put(position, copiedFigure);
		}

		// Копируем список съеденных фигур
		copiedBoard.getEatenFigures().addAll(originalBoard.getEatenFigures());

		return copiedBoard;
	}

	private Piece createCopyOfFigure(Piece originalFigure) {
		if (originalFigure instanceof Pawn) {
			Pawn newPawn = new Pawn(originalFigure.getColor());
			if (((Pawn) originalFigure).isHasMoved()) newPawn.setHasMoved();
			return newPawn;
		} else if (originalFigure instanceof King) {
			King newKing = new King(originalFigure.getColor());
			if (((King) originalFigure).isHasMoved()) newKing.setHasMoved();
			if (((King) originalFigure).isHasChecked()) newKing.setHasChecked();
			return newKing;
		} else if (originalFigure instanceof Rook) {
			Rook newRook = new Rook(originalFigure.getColor());
			if (((Rook) originalFigure).isHasMoved()) newRook.setHasMoved();
			return newRook;
		} else
		if (originalFigure instanceof Queen) return new Queen(originalFigure.getColor());
		else if (originalFigure instanceof Knight) return new Knight(originalFigure.getColor());
		else if (originalFigure instanceof Bishop) return new Bishop(originalFigure.getColor());

		return null;
	}

	public void switchPlayer() {
		currentPlayerColor = currentPlayerColor.equals("WHITE") ? "BLACK" : "WHITE";
	}

	public void addEatenFigures(Piece eatenFigure) {
		this.eatenFigures.add(new MutablePair<>(getMotionList().size(), eatenFigure));
	}

	public void placeFigure(Piece Piece, Position position) {
		board.put(position, Piece);
	}
	public void deleteFigureAt(Position position) {
		board.remove(position);
	}

	private void placeInitialPieces(String color) {
		int pawnRow = (color.equals("white")) ? 2 : 7;
		int backRow = (color.equals("white")) ? 1 : 8;

		// Расставить пешки
		for (char col = 'a'; col <= 'h'; col++) {
			Position pawnPosition = new Position(col, pawnRow);
			Pawn pawn = new Pawn(color);
			board.put(pawnPosition, pawn);
		}

		// Расставить остальные фигуры
		placeNonPawnPieces(color, backRow);
	}

	private void placeNonPawnPieces(String color, int row) {
		Position rook1Position = new Position('a', row);
		Position knight1Position = new Position('b', row);
		Position bishop1Position = new Position('c', row);
		Position queenPosition = new Position('d', row);
		Position kingPosition = new Position('e', row);
		Position bishop2Position = new Position('f', row);
		Position knight2Position = new Position('g', row);
		Position rook2Position = new Position('h', row);

		// Расставить ладьи
		board.put(rook1Position, new Rook(color));
		board.put(rook2Position, new Rook(color));

		// Расставить кони
		board.put(knight1Position, new Knight(color));
		board.put(knight2Position, new Knight(color));

		// Расставить слоны
		board.put(bishop1Position, new Bishop(color));
		board.put(bishop2Position, new Bishop(color));

		// Расставить ферзя
		board.put(queenPosition, new Queen(color));

		// Расставить короля
		board.put(kingPosition, new King(color));
	}

	public void resetBoard() {
		board.clear();
		initialize();
	}

	public boolean isValidMove(Position from, Position to, Chessboard board) {
		Piece movingFigure = board.getFigureAt(from);
		Piece targetFigure = board.getFigureAt(to);

		// Проверяем, фигурам какого цвета сейчас можно ходить
		if ((movingFigure != null && board.getMotionList().isEmpty() && movingFigure.getColor().equals("white")) ||
				(!board.getMotionList().isEmpty() && !board.getFigureAt(getMotionList().get(getMotionList().size() - 1).getValue()).getColor().equals(movingFigure.getColor()))) {
			if (movingFigure.isValidMove(from, to, this)) {
				// Проверяем, чтобы на клетке, на которую совершается ход, не стояла фигура того же цвета
				if (targetFigure == null || !targetFigure.getColor().equals(movingFigure.getColor())) {
					// Проверяем, не приводит ли ход к шаху
					if (!isMoveLeadsToCheck(from, to, movingFigure)) {
						return true;
					}
				}
			}
			if (isCastleMove(from, to, board) != null) {
				System.out.println("Можно сделать рокировку");
				return true;
			}
			return false;
		}
		return false;
	}

	public List<Position> getValidMoves(Position from) {
		var result = new ArrayList<Position>();
		for (int row = 1; row <= 8; row++) {
			for (int col = 1; col <= 8; col++) {
				Position to = new Position(row, col);
				if (isValidMove(from, to, this)){
					result.add(to);
				}
			}
		}
		return result;
	}

	private boolean isMoveLeadsToCheck(Position from, Position to, Piece movingFigure) {
		Map<Position, Piece> tempBoard = new HashMap<>(board);
		tempBoard.put(to, tempBoard.remove(from));

		return isKingInCheck(movingFigure.getColor(), tempBoard);
	}
	public boolean isKingInCheck(String kingColor, Map<Position, Piece> board) {
		// Находим позицию короля нужного цвета
		Position kingPosition = findKingPosition(kingColor, board);
		if (kingPosition == null) {
			return false;
		}
		Chessboard cb = new Chessboard();
		cb.board = board;
		// Проходимся по всей доске и проверяем каждую фигуру
		for (Map.Entry<Position, Piece> entry : board.entrySet()) {
			Position currentPosition = entry.getKey();
			Piece currentFigure = cb.getFigureAt(currentPosition);

			// Если фигура принадлежит другому игроку и может атаковать короля, то король находится под шахом
			if (!currentFigure.getColor().equals(kingColor) && currentFigure.isValidMove(currentPosition, kingPosition, cb)) {
				//System.out.println("фигура " + currentFigure.getFileName() + " принадлежит другому игроку и может атаковать короля, ШАХ королю цвета " + cb.getFigureAt(kingPosition).getColor() + cb.getFigureAt(kingPosition).getFileName());
				((King)cb.getFigureAt(kingPosition)).setHasChecked();
				return true;
			}
		}
		// Если ни одна фигура не атакует короля, значит, он не под шахом
		return false;
	}

	public List<Position> getPossibleMoves(Position currentPosition, Chessboard board) {
		List<Position> possibleMoves = new ArrayList<>();
		Piece myfigure = board.getFigureAt(currentPosition);
		// Получаем цвет текущей фигуры
		String color = myfigure.getColor();

		// Проходимся по всем клеткам на доске
		for (int row = 1; row <= 8; row++) {
			for (int col = 1; col <= 8; col++) {
				Position targetPosition = new Position(row, col);

				// Проверяем, может ли текущая фигура совершить ход на целевую позицию
				if (isValidMove(currentPosition, targetPosition, board) && currentPosition != targetPosition) {
					// Создаем временную доску и совершаем ход, чтобы проверить, не будет ли король под шахом
					Map<Position, Piece> tempBoard = new HashMap<>(board.getChessboard());
					tempBoard.put(targetPosition, tempBoard.remove(currentPosition));

					// Проверяем, не окажется ли король под шахом после этого хода
					if (!board.isKingInCheck(color, tempBoard)) {
						// Если не окажется, добавляем позицию в список возможных ходов
						possibleMoves.add(targetPosition);
					}
				}
			}
		}
		return possibleMoves;
	}
	public boolean hasPossibleMoves(String color, Chessboard board) {
		for (Map.Entry<Position, Piece> entry : board.getChessboard().entrySet()) {
			Position position = entry.getKey();
			Piece Piece = entry.getValue();
			if (Piece.getColor().equals(color)) {
				List<Position> moves = getPossibleMoves(position, board);
				if (!moves.isEmpty()) {
					return true;
				}
			}
		}
		return false;
	}

	public Position findKingPosition(String kingColor, Map<Position, Piece> board) {
		//System.out.println("Ищем короля ");
		Chessboard cb = new Chessboard();
		cb.board = board;
		for (Map.Entry<Position, Piece> entry : board.entrySet()) {
			Position position = entry.getKey();
			Piece Piece = cb.getFigureAt(position);
			if (Piece instanceof King){
				if (Piece.getColor().equals(kingColor)) {
					return position;
				}
			}
		}
		return null;
	}

	public MutablePair<Position, Position> isCastleMove(Position from, Position to, Chessboard board) {
		// Получаем короля и ладью
		Piece king = board.getFigureAt(from);
		if (to.getColAsNumber() != 3 && to.getColAsNumber() != 7) return null;

		// Проверяем, является ли фигура королем
		if (!(king instanceof King)) {
			return null;
		}
		if (((King) king).isHasChecked()) return null;
		if (from.getRow() != to.getRow()) return null;

		// Позиция целевой ладьи
		int rookRow = from.getRow();
		int rookCol = 8 - to.getColAsNumber() == 1? 8: 1;

		Position rookPosition = new Position(rookCol, rookRow);
		Piece rook = board.getFigureAt(rookPosition);
		System.out.println("king = " + king);
		System.out.println("rook = " + rook);

		// Проверяем, находится ли король в начальной позиции
		if (((King)king).isHasMoved() || ((Rook)rook).isHasMoved()) {
			return null;
		}
		if (board.areFiguresBetween(from, rookPosition)) {
			return null;
		}

		Position currentKingPos = from;
		int dir = from.getColAsNumber() > to.getColAsNumber()? -1: 1;
		Chessboard tempBoard = copyChessboard(board);
		while (currentKingPos.getColAsNumber() != to.getColAsNumber())
		{
			System.out.println(currentKingPos.getColAsNumber() + " " + to.getColAsNumber());
			// Проверяем, не находится ли король под шахом на этой позиции
			if (tempBoard.isKingInCheck(king.getColor(), tempBoard.getChessboard())) {
				System.out.println("Во время рокировки король находится под шахом в позиции " + currentKingPos);
				return null; // Позиция находится под шахом
			}

			Position nextPosition = new Position(currentKingPos.getColAsNumber() + dir, from.getRow());
			System.out.println("currentKingPos " + currentKingPos + " " + nextPosition);

			tempBoard.moveFigure(currentKingPos, nextPosition, tempBoard);

			currentKingPos = nextPosition;
			System.out.println("tempBoard");
			System.out.println(tempBoard);

		}
		System.out.println("основная доска");
		System.out.println(board);

		int futureRookCol = 8 - to.getColAsNumber() == 1? 6: 4;
		Position futureRookPos = new Position(futureRookCol, from.getRow());
		System.out.println("Все условия для рокировки выполнены, позиции ладьи для рокировки: "+ rookPosition + " -> " + futureRookPos);
		return new MutablePair<>(rookPosition, futureRookPos);
	}


	public void eatFigure(Position from, Position to)
	{
		figureCapture(getFigureAt(to));
		deleteFigureAt(to);
	}

	public boolean isEdible(Position from, Position to)
	{
		Piece movingFigure = board.get(from);
		Piece targetFigure = board.get(to);
		if (movingFigure != null) {
			// Проверка, что ход допустим для фигуры
			if (movingFigure.isValidMove(from, to, this)) {
				// Проверка, что в целевой клетке нет фигуры того же цвета
				if (targetFigure == null || !targetFigure.getColor().equals(movingFigure.getColor())) {
					if (targetFigure != null) {
						return true;
					}
				}
			}
		}
		return false;
	}
	public Map<String, Object> moveFigure(Position from, Position to){
		return moveFigure(from, to, this);
	}
	public Map<String, Object> moveFigure(Position from, Position to, Chessboard board) {
		Map<String, Object> result = new HashMap<>();

		Piece movingFigure = board.getFigureAt(from);
		Piece targetFigure = board.getFigureAt(to);
		if (movingFigure != null) {
			if (targetFigure != null) {
				figureCapture(targetFigure);
			}
			if (movingFigure instanceof Pawn && ((Pawn) movingFigure).canCaptureEnPassant(from, to, board)) {
				MutablePair<Position, Position> lastMove = board.getMotionList().get(board.getMotionList().size() - 1);
				Position toLastMove = lastMove.getValue();
				this.eatFigure(from, toLastMove);
			}

			// Перемещаем фигуру на новую позицию
			board.getChessboard().remove(from);
			board.getChessboard().put(to, movingFigure);
			board.motionList.add(new MutablePair<>(from, to));

			// Проверяем, если это пешка, меняем флаг
			if (movingFigure instanceof Pawn) {
				if (checkPromotion(to)) {
					result.put("promotePawn", Map.of("position", to));
				}
				((Pawn) movingFigure).setHasMoved();
			}
			if (movingFigure instanceof King) {
				((King) movingFigure).setHasMoved();
				if (Math.abs(from.getColAsNumber() - to.getColAsNumber()) == 2) {
					Position rookFrom = from.getColAsNumber() < to.getColAsNumber()? new Position("h" + from.getRow()) : new Position("a" + from.getRow());
					Position rookTo = from.getColAsNumber() < to.getColAsNumber()? new Position("f" + from.getRow()) : new Position("d" + from.getRow());
					var newPiece = new Rook(getFigureAt(rookFrom).getColor(), true);
					placeFigure(newPiece, rookTo);
					deleteFigureAt(rookFrom);

					result.put("castling", Map.of("from", rookFrom, "to", rookTo));
				}
			}
			if (movingFigure instanceof Rook) ((Rook) movingFigure).setHasMoved();
			// Вывести информацию о ходе
			System.out.println("Успех! " + movingFigure.getColor() + " " + movingFigure.getClass().getSimpleName() + " сделала ход с " + from + " на " + to + ".\n");

			String opponentColor = movingFigure.getColor().equals("white")? "black" : "white";
			String checkCheckmate = isCheckmate(opponentColor, board);
			if (checkCheckmate != null) {
				if (checkCheckmate.equals("draw")) {
					result.put("draw", true);
				} else if (checkCheckmate.equals("black") || checkCheckmate.equals("white")) {
					result.put("victory", Map.of("winner", checkCheckmate));
				}
			}

		}
		switchPlayer();
		return result;
	}

	public String isCheckmate(String kingColor, Chessboard board) {
		// Проверяем, находится ли король нужного цвета под шахом
		boolean isKingInCheck = isKingInCheck(kingColor, board.getChessboard());
		if (!isKingInCheck){
			if (!hasPossibleMoves(kingColor, board)) {
				// вернуть ничью - пат
				return "draw";
			}
		} else {
			if (hasPossibleMoves(kingColor, board)) {
				// возвращаем, что все нормально, игра идет дальше
				return null;
			} else {
				// возвращаем информацию о проигрыше kingColor
				return kingColor.equals("white")? "black" : "white";

			}
		}
		return null;
	}

	public boolean checkPromotion(Position position) {
		Piece pawn = getFigureAt(position);

		// Проверка, что это пешка, и что она дошла до противоположного конца доски
		if (pawn instanceof Pawn) {
			if (position.getRow() == 1 && pawn.getColor().equals("black")) {
				return true;
			} else if (position.getRow() == 8 && pawn.getColor().equals("white")) {
				return true;
			}
		}
		return false;
	}

	public void exchangePawn(Position position, String figName)
	{
		Piece Piece = getFigureAt(position);
		switch (figName)
		{
			case "Queen":
				Piece = new Queen(Piece.getColor());
				break;
			case "Knight":
				Piece = new Knight(Piece.getColor());
				break;
			case "Rook":
				Piece = new Rook(Piece.getColor());
				break;
			case "Bishop":
				Piece = new Bishop(Piece.getColor());
				break;
		}
		placeFigure(Piece, position);
	}

	private void figureCapture(Piece capturedFigure) {
		// код для обработки события съедания фигуры
		eatenFigures.add(new MutablePair<>(motionList.size(), capturedFigure));
		System.out.println("Фигура " + capturedFigure.getFileName() + " съедена!");
	}

	public Piece getFigureAt(Position position) {
		return board.get(position);
	}

	public boolean areFiguresBetween(Position from, Position to) {
		// Проверка наличия фигур на горизонтальном пути
		if (from.getRow() == to.getRow()) {
			int startCol = Math.min(from.getColAsNumber(), to.getColAsNumber());
			int endCol = Math.max(from.getColAsNumber(), to.getColAsNumber());

			for (int col = startCol + 1; col < endCol; col++) {
				Position position = new Position(col, from.getRow());
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}

		// Проверка наличия фигур на вертикальном пути
		if (from.getColAsNumber() == to.getColAsNumber()) {
			int startRow = Math.min(from.getRow(), to.getRow());
			int endRow = Math.max(from.getRow(), to.getRow());

			for (int row = startRow + 1; row < endRow; row++) {
				Position position = new Position(from.getColAsNumber(), row);
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}
		// Проверка наличия фигур на диагональном пути (слева вверх)
		if (from.getRow() > to.getRow() && from.getColAsNumber() > to.getColAsNumber()) {
			for (int i = 1; i < from.getRow() - to.getRow(); i++) {
				Position position = new Position(from.getColAsNumber() - i, from.getRow() - i);
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}

		// Проверка наличия фигур на диагональном пути (справа вниз)
		if (from.getRow() < to.getRow() && from.getColAsNumber() < to.getColAsNumber()) {
			for (int i = 1; i < to.getRow() - from.getRow(); i++) {
				Position position = new Position(from.getColAsNumber() + i, from.getRow() + i);
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}

		// Проверка наличия фигур на диагональном пути (слева вниз)
		if (from.getRow() < to.getRow() && from.getColAsNumber() > to.getColAsNumber()) {
			for (int i = 1; i < to.getRow() - from.getRow(); i++) {
				Position position = new Position(from.getColAsNumber() - i, from.getRow() + i);
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}

		// Проверка наличия фигур на диагональном пути (справа вверх)
		if (from.getRow() > to.getRow() && from.getColAsNumber() < to.getColAsNumber()) {
			for (int i = 1; i < from.getRow() - to.getRow(); i++) {
				Position position = new Position(from.getColAsNumber() + i, from.getRow() - i);
				if (board.containsKey(position)) {
					return true; // Есть фигура на пути
				}
			}
		}

		return false; // Фигур нет на пути
	}

	@Override
	public String toString() {
		StringBuilder result = new StringBuilder();

		for (int row = 8; row >= 1; row--) {
			for (char col = 'a'; col <= 'h'; col++) {
				Position position = new Position(col, row);
				Piece Piece = board.get(position);

				// Если на клетке есть фигура, добавляем ее в строку
				if (Piece != null) {
					result.append(Piece).append(" ");
				} else {
					result.append("   ");
				}
			}
			result.append("\n");
		}

		return result.toString();
	}
}
