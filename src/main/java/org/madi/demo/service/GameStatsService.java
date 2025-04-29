package org.madi.demo.service;

import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.madi.demo.dto.ColorStatsDTO;
import org.madi.demo.dto.UserGameStatsDTO;
import org.madi.demo.entities.GameHistory;
import org.madi.demo.entities.User;
import org.madi.demo.repository.GameStatsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GameStatsService {
	private final GameStatsRepository gameStatsRepository;

	public UserGameStatsDTO getUserGameStats(User user) {
		int total = gameStatsRepository.countTotalGamesByUser(user);
		int wins = gameStatsRepository.countWinsByUser(user);
		int losses = gameStatsRepository.countLossesByUser(user);
		int draws = gameStatsRepository.countDrawsByUser(user);

		// Получаем статистику по цветам через нативный запрос
		Map<String, Long> colorStatsMap = gameStatsRepository.countGamesByColorNative(user.getId());
		ColorStatsDTO colorStats = new ColorStatsDTO(
				colorStatsMap.getOrDefault("white", 0L),
				colorStatsMap.getOrDefault("black", 0L)
		);

		Double avgDuration = gameStatsRepository.averageGameDurationMinutes(user);

		return new UserGameStatsDTO(total, wins, losses, draws, colorStats, avgDuration);
	}

	public ColorStatsDTO getColorStats(User user) {
		Map<String, Long> result = gameStatsRepository.countGamesByColorNative(user.getId());
		return new ColorStatsDTO(
				result.getOrDefault("white", 0L),
				result.getOrDefault("black", 0L)
		);
	}

	public List<GameHistory> getRecentGames(User user, int limit) {
		return gameStatsRepository.findRecentGames(user, limit);
	}
}