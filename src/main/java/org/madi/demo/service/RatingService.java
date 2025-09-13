package org.madi.demo.service;

import org.springframework.stereotype.Service;

@Service
public class RatingService {

	private static final int K_FACTOR = 32;

	/**
	 * Расчёт нового рейтинга по системе Эло
	 *
	 * @param ratingA текущий рейтинг игрока A
	 * @param ratingB текущий рейтинг игрока B
	 * @param resultA результат матча (1 - победа, 0.5 - ничья, 0 - поражение)
	 * @return новый рейтинг игрока A
	 */
	public int calculateNewElo(int ratingA, int ratingB, double resultA) {
		double expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400.0));
		return (int) Math.round(ratingA + K_FACTOR * (resultA - expectedA));
	}
}