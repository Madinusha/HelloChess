package org.madi.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public abstract class Piece {
    @JsonProperty("color")
    private String color; // Цвет фигуры ("white" или "black")

    public String getFileName() {
        return (getClass().getSimpleName());
    }

    public abstract boolean isValidMove(Position from, Position to, Chessboard board);

    public abstract String getShortName();
}
