package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * История шахматных партий
 */
@Entity
@Table(name = "game_history")
@Getter
@Setter
@NoArgsConstructor
public class GameHistory {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Игрок белыми
     */
	@ManyToOne
	@JoinColumn(name = "white_player_id")
	private User whitePlayer;
    /**
     * Игрок черными
     */
	@ManyToOne
	@JoinColumn(name = "black_player_id")
	private User blackPlayer;
    /**
     * Запись партии ф формате pgn
     */
	@Column(name = "PGN", nullable = false)
	private String PGN;
    /**
     * Результат партии
     */
	@Column(name = "result", nullable = false)
	private String result;
    /**
     * Стартовое время партии (минуты)
     */
	@Column(name = "initial_time_minutes", nullable = false)
	private int initialTimeMinutes;
    /**
     * Стартовое время партии (добавочные секунды)
     */
	@Column(name = "initial_time_increment", nullable = false)
	private int initialTimeIncrement;
    /**
     * Время начала партии
     */
	@Column(name = "start_time", nullable = false)
	private LocalDateTime startTime;
    /**
     * Время окончания партии
     */
	@Column(name = "end_time")
	private LocalDateTime endTime;
}