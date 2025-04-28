package org.madi.demo.service;

import jakarta.persistence.EntityNotFoundException;
import org.madi.demo.entities.Friendship;
import org.madi.demo.entities.Friendship.FriendshipStatus;
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
import java.util.stream.Stream;

@Service
public class FriendshipService {

	@Autowired
	private FriendshipRepository friendshipRepository;

	@Autowired
	private UserRepository userRepository;

	public List<FriendDTO> getUserFriends(User user) {
		// Получаем друзей, где текущий пользователь инициатор
		List<Friendship> outgoingFriendships = friendshipRepository.findByUserAndStatus(
				user,
				Friendship.FriendshipStatus.ACCEPTED
		);

		// Получаем друзей, где текущий пользователь получатель
		List<Friendship> incomingFriendships = friendshipRepository.findByFriendAndStatus(
				user,
				Friendship.FriendshipStatus.ACCEPTED
		);

		// Объединяем и преобразуем
		return Stream.concat(
						outgoingFriendships.stream().map(f -> createFriendDTO(f.getFriend())),
						incomingFriendships.stream().map(f -> createFriendDTO(f.getUser()))
				)
				.distinct() // На случай дубликатов
				.collect(Collectors.toList());
	}

	private FriendDTO createFriendDTO(User user) {
		FriendDTO dto = new FriendDTO();
		dto.setNickname(user.getNickname());
		dto.setRating(user.getRating());
		return dto;
	}

	public List<FriendDTO> getPendingRequests(User user) {
		return friendshipRepository.findByFriendAndStatus(user, Friendship.FriendshipStatus.PENDING)
				.stream()
				.map(friendship -> {
					FriendDTO dto = new FriendDTO();
					dto.setNickname(friendship.getUser().getNickname());
					dto.setRating(friendship.getUser().getRating());
					return dto;
				})
				.collect(Collectors.toList());
	}

	public List<FriendDTO> getOutgoingRequests(User user) {
		return friendshipRepository.findByUserAndStatus(user, Friendship.FriendshipStatus.PENDING).stream()
				.map(friendship -> {
					FriendDTO dto = new FriendDTO();
					dto.setNickname(friendship.getFriend().getNickname());
					dto.setRating(friendship.getFriend().getRating());
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
	public void acceptFriendRequest(String senderNickname, User currentUser) {
		User sender = userRepository.findByNickname(senderNickname);
		if (sender == null) {
			throw new EntityNotFoundException("Пользователь с ником '" + senderNickname + "' не найден");
		}

		Friendship request = friendshipRepository.findByUserAndFriend(sender, currentUser);
		if (request == null) {
			throw new EntityNotFoundException("Запрос дружбы не найден");
		}

		if (request.getStatus() != Friendship.FriendshipStatus.PENDING) {
			throw new IllegalStateException("Невозможно принять уже обработанный запрос");
		}

		request.setStatus(Friendship.FriendshipStatus.ACCEPTED);
		friendshipRepository.save(request);
	}

	@Transactional
	public void declineFriendRequest(String senderNickname, User currentUser) {
		User sender = userRepository.findByNickname(senderNickname);
		if (sender == null) {
			throw new EntityNotFoundException("Пользователь не найден");
		}

		friendshipRepository.deleteFriendshipBetweenUsers(
				sender,
				currentUser,
				Friendship.FriendshipStatus.PENDING
		);
	}

	@Transactional
	public void removeFriend(String friendNickname, User currentUser) {
		User friend = userRepository.findByNickname(friendNickname);
		if (friend == null) {
			throw new EntityNotFoundException("Пользователь с ником '" + friendNickname + "' не найден");
		}

		Friendship friendship1 = friendshipRepository.findByUserAndFriendAndStatus(
				currentUser, friend, Friendship.FriendshipStatus.ACCEPTED);

		Friendship friendship2 = friendshipRepository.findByUserAndFriendAndStatus(
				friend, currentUser, Friendship.FriendshipStatus.ACCEPTED);

		if (friendship1 == null && friendship2 == null) {
			throw new IllegalStateException("Пользователь '" + friendNickname + "' не является вашим другом");
		}

		if (friendship1 != null) {
			friendshipRepository.delete(friendship1);
		}
		if (friendship2 != null) {
			friendshipRepository.delete(friendship2);
		}
	}

	public String getDetailedFriendshipStatus(User currentUser, User otherUser) {
		if (currentUser.getNickname().equals(otherUser.getNickname())) {
			return "me";
		}

		boolean isFriend = friendshipRepository.existsByUserAndFriendAndStatus(currentUser, otherUser, FriendshipStatus.ACCEPTED) ||
				friendshipRepository.existsByUserAndFriendAndStatus(otherUser, currentUser, FriendshipStatus.ACCEPTED);

		if (isFriend) {
			return "friend";
		}

		// Проверяем исходящий запрос (текущий пользователь отправил запрос другому)
		boolean isOutgoing = friendshipRepository.existsByUserAndFriendAndStatus(currentUser, otherUser, FriendshipStatus.PENDING);
		if (isOutgoing) {
			return "pending_outgoing";
		}

		// Проверяем входящий запрос (другой пользователь отправил запрос текущему)
		boolean isIncoming = friendshipRepository.existsByUserAndFriendAndStatus(otherUser, currentUser, FriendshipStatus.PENDING);
		if (isIncoming) {
			return "pending_incoming";
		}

		// Проверяем отклоненные запросы
		boolean wasDeclined = friendshipRepository.existsByUserAndFriendAndStatus(currentUser, otherUser, FriendshipStatus.DECLINED) ||
				friendshipRepository.existsByUserAndFriendAndStatus(otherUser, currentUser, FriendshipStatus.DECLINED);
		if (wasDeclined) {
			return "declined";
		}

		return "none";
	}
	
}
