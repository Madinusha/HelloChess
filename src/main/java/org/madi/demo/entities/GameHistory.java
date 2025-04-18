package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "game_history")
public class GameHistory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "white_player_id")
	private User whitePlayer;

	@ManyToOne
	@JoinColumn(name = "black_player_id")
	private User blackPlayer;

	@Column(nullable = false)
	private String PGN;

	@Column(nullable = false)
	private String result;

	@Column(nullable = false)
	private int initialTimeMinutes;

	@Column(nullable = false)
	private int initialTimeIncrement;

	@Column(nullable = false)
	private LocalDateTime startTime;

	@Column
	private LocalDateTime endTime;

}