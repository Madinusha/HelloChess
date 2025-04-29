package org.madi.demo.repository;

import jakarta.persistence.Tuple;
import org.madi.demo.dto.ColorStatsDTO;
import org.madi.demo.entities.GameHistory;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Map;

@Repository
public interface GameStatsRepository extends JpaRepository<GameHistory, Long> {

	// Общее количество игр пользователя (вне зависимости от цвета)
	@Query("SELECT COUNT(g) FROM GameHistory g WHERE g.whitePlayer = :user OR g.blackPlayer = :user")
	int countTotalGamesByUser(@Param("user") User user);

	// Количество побед (победы белыми + победы черными)
	@Query("SELECT COUNT(g) FROM GameHistory g WHERE " +
			"(g.whitePlayer = :user AND g.result = 'WHITE_WIN') OR " +
			"(g.blackPlayer = :user AND g.result = 'BLACK_WIN')")
	int countWinsByUser(@Param("user") User user);

	// Количество поражений (поражения белыми + поражения черными)
	@Query("SELECT COUNT(g) FROM GameHistory g WHERE " +
			"(g.whitePlayer = :user AND g.result = 'BLACK_WIN') OR " +
			"(g.blackPlayer = :user AND g.result = 'WHITE_WIN')")
	int countLossesByUser(@Param("user") User user);

	// Количество ничьих
	@Query("SELECT COUNT(g) FROM GameHistory g WHERE " +
			"(g.whitePlayer = :user OR g.blackPlayer = :user) AND g.result = 'DRAW'")
	int countDrawsByUser(@Param("user") User user);

	// Статистика по времени игры (средняя продолжительность игры)
	@Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, g.startTime, g.endTime)) " +
			"FROM GameHistory g WHERE (g.whitePlayer = :user OR g.blackPlayer = :user) AND g.endTime IS NOT NULL")
	Double averageGameDurationMinutes(@Param("user") User user);

	// Статистика по цветам (сколько игр сыграно белыми/черными)
	@Query(
			value = "SELECT " +
					"COUNT(CASE WHEN white_player_id = :userId THEN 1 END) as white, " +
					"COUNT(CASE WHEN black_player_id = :userId THEN 1 END) as black " +
					"FROM game_history WHERE white_player_id = :userId OR black_player_id = :userId",
			nativeQuery = true
	)
	Map<String, Long> countGamesByColorNative(@Param("userId") Long userId);

	// Последние N игр
	@Query("SELECT g FROM GameHistory g WHERE g.whitePlayer = :user OR g.blackPlayer = :user " +
			"ORDER BY g.startTime DESC LIMIT :limit")
	List<GameHistory> findRecentGames(@Param("user") User user, @Param("limit") int limit);
}