package org.madi.demo.repository;

import org.madi.demo.entities.Friendship;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

	List<Friendship> findByFriendAndStatus(User friend, Friendship.FriendshipStatus status);

	@Query("SELECT f FROM Friendship f WHERE f.user.id = :userId AND f.status = 'ACCEPTED'")
	List<Friendship> findAcceptedFriends(@Param("userId") Long userId);

	boolean existsByUserAndFriend(User user, User friend);
}