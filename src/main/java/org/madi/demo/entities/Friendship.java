package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendships")
@Getter
@Setter
@NoArgsConstructor
public class Friendship {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user; // Тот, кто отправил запрос

	@ManyToOne
	@JoinColumn(name = "friend_id")
	private User friend; // Тот, кому отправили запрос

	@Enumerated(EnumType.STRING)
	private FriendshipStatus status; // Статус

	private LocalDateTime createdAt; // Дата создания запроса

	public enum FriendshipStatus {
		PENDING, ACCEPTED, DECLINED
	}
}