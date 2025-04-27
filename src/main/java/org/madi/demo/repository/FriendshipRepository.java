package org.madi.demo.repository;

import org.madi.demo.entities.Friendship;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

	List<Friendship> findByFriendAndStatus(User friend, Friendship.FriendshipStatus status);

	@Query("SELECT f FROM Friendship f WHERE f.user.id = :userId AND f.status = 'ACCEPTED'")
	List<Friendship> findAcceptedFriends(@Param("userId") Long userId);

	boolean existsByUserAndFriend(User user, User friend);

	List<Friendship> findByUserAndStatus(User user, Friendship.FriendshipStatus status);

	Friendship findByUserAndFriend(User user, User friend);

	Friendship findByUserAndFriendAndStatus(User user, User friend, Friendship.FriendshipStatus status);

	boolean existsByUserAndFriendAndStatus(User user, User friend, Friendship.FriendshipStatus status);

	@Query("SELECT f FROM Friendship f WHERE " +
			"(f.user = :user1 AND f.friend = :user2) OR " +
			"(f.user = :user2 AND f.friend = :user1)")
	List<Friendship> findAnyBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

	@Modifying
	@Query("DELETE FROM Friendship f WHERE " +
			"((f.user = :user1 AND f.friend = :user2) OR " +
			"(f.user = :user2 AND f.friend = :user1)) AND " +
			"f.status = :status")
	void deleteFriendshipBetweenUsers(
			@Param("user1") User user1,
			@Param("user2") User user2,
			@Param("status") Friendship.FriendshipStatus status);
}