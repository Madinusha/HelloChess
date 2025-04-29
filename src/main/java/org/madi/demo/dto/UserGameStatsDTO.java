package org.madi.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserGameStatsDTO {
	private int totalGames;
	private int wins;
	private int losses;
	private int draws;
	private double winRate;
	private double lossRate;
	private double drawRate;
	private ColorStatsDTO colorStats;
	private Double averageGameDuration;

	public UserGameStatsDTO(int total, int wins, int losses, int draws, ColorStatsDTO colorStats, Double avgDuration) {
		this.totalGames = total;
		this.wins = wins;
		this.losses = losses;
		this.draws = draws;
		this.winRate = total > 0 ? (double) wins / total * 100 : 0;
		this.lossRate = total > 0 ? (double) losses / total * 100 : 0;
		this.drawRate = total > 0 ? (double) draws / total * 100 : 0;
		this.colorStats = colorStats;
		this.averageGameDuration = avgDuration;
	}
}
