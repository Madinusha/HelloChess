package org.madi.demo.service;

import jakarta.persistence.EntityNotFoundException;
import org.madi.demo.dto.FriendRequestDTO;
import org.madi.demo.entities.Friendship;
import org.madi.demo.repository.FriendshipRepository;
import org.springframework.stereotype.Service;
import org.madi.demo.entities.User;
import org.madi.demo.dto.FriendDTO;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendshipService {

	@Autowired
	private FriendshipRepository friendshipRepository;

	@Autowired
	private UserRepository userRepository;

	public List<FriendDTO> getUserFriends(User user) {
		return friendshipRepository.findAcceptedFriends(user.getId())
				.stream()
				.map(friendship -> {
					FriendDTO dto = new FriendDTO();
					dto.setNickname(friendship.getFriend().getNickname());
					dto.setRating(friendship.getFriend().getRating());
					return dto;
				})
				.collect(Collectors.toList());
	}

	public List<FriendRequestDTO> getPendingRequests(User user) {
		return friendshipRepository.findByFriendAndStatus(user, Friendship.FriendshipStatus.PENDING)
				.stream()
				.map(friendship -> {
					FriendRequestDTO dto = new FriendRequestDTO();
					dto.setId(friendship.getId());
					dto.setSenderNickname(friendship.getUser().getNickname());
					dto.setCreatedAt(friendship.getCreatedAt());
					dto.setStatus(friendship.getStatus().name());
					return dto;
				})
				.collect(Collectors.toList());
	}

	@Transactional
	public void sendFriendRequest(User sender, User receiver) {
		if (friendshipRepository.existsByUserAndFriend(sender, receiver)) {
			throw new IllegalStateException("Запрос уже отправлен");
		}

		Friendship friendship = new Friendship();
		friendship.setUser(sender);
		friendship.setFriend(receiver);
		friendship.setStatus(Friendship.FriendshipStatus.PENDING);
		friendship.setCreatedAt(LocalDateTime.now());
		friendshipRepository.save(friendship);
	}

	@Transactional
	public void acceptFriendRequest(Long requestId, User currentUser) {
		Friendship request = friendshipRepository.findById(requestId)
				.orElseThrow(() -> new EntityNotFoundException("Запрос не найден"));

		if (!request.getFriend().equals(currentUser)) {
			throw new SecurityException("Нет прав для принятия этого запроса");
		}

		request.setStatus(Friendship.FriendshipStatus.ACCEPTED);
		friendshipRepository.save(request);
	}

	@Transactional
	public void declineFriendRequest(Long requestId, User currentUser) {
		Friendship request = friendshipRepository.findById(requestId)
				.orElseThrow(() -> new EntityNotFoundException("Запрос не найден"));

		if (!request.getFriend().equals(currentUser)) {
			throw new SecurityException("Нет прав для отклонения этого запроса");
		}

		friendshipRepository.delete(request);
	}
}
