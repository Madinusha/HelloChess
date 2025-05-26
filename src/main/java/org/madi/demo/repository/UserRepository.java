package org.madi.demo.repository;

import org.madi.demo.dto.RatingDistribution;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	User findByNickname(String nickname);
	User findByEmail(String email);
	List<User> findByNicknameContainingIgnoreCase(String nickname, Pageable pageable);
	boolean existsByNickname(String nickname);
	List<User> findTop10ByOrderByRatingDesc();
	@Query("SELECT new org.madi.demo.dto.RatingDistribution(" +
			"CONCAT(FLOOR(u.rating/100)*100, '-', FLOOR(u.rating/100)*100+99), " +
			"COUNT(u)) " +
			"FROM User u " +
			"GROUP BY FLOOR(u.rating/100) " +
			"ORDER BY FLOOR(u.rating/100)")
	List<RatingDistribution> getRatingDistribution();

	@Query("SELECT AVG(u.rating) FROM User u")
	Double getAverageRating();
}
