package org.madi.demo.repository;

import org.madi.demo.entities.GameHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameHistoryRepository extends JpaRepository<GameHistory, Long> {
	@Modifying
	@Query("UPDATE GameHistory g SET g.whitePlayer.id = :deletedUserId WHERE g.whitePlayer.id = :userId")
	void updateWhitePlayerToDeletedUser(@Param("userId") Long userId, @Param("deletedUserId") Long deletedUserId);

	@Modifying
	@Query("UPDATE GameHistory g SET g.blackPlayer.id = :deletedUserId WHERE g.blackPlayer.id = :userId")
	void updateBlackPlayerToDeletedUser(@Param("userId") Long userId, @Param("deletedUserId") Long deletedUserId);
}