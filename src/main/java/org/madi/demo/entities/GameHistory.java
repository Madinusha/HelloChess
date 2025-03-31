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

	@Column(nullable = false)
	private String playerWhite;

	@Column(nullable = false)
	private String playerBlack;

	@Column(nullable = false)
	private LocalDateTime startTime;

	@Column
	private LocalDateTime endTime;

}