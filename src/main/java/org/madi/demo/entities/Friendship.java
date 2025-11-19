package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.madi.demo.enums.FriendshipStatus;

import java.time.LocalDateTime;

/**
 * Таблица дружеских отношений пользователей
 */
@Entity
@Table(name = "friendships")
@NoArgsConstructor
@Getter
@Setter
public class Friendship {
    /**
     * id записи дружбы
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Тот, кто отправил запрос
     */
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;
    /**
     *  Тот, кому отправили запрос
     */
	@ManyToOne
	@JoinColumn(name = "friend_id")
	private User friend;
    /**
     * Статус дружбы
     */
	@Enumerated(EnumType.STRING)
    @Column(name = "status")
	private FriendshipStatus status;
    /**
     * Дата создания запроса
     */
    @Column(name = "created_at")
	private LocalDateTime createdAt;
}