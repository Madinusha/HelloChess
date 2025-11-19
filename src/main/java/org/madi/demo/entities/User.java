package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.madi.demo.enums.LanguageLevel;
import org.madi.demo.enums.Sex;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


/**
 * Пользователи
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class User implements UserDetails {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
	private Long id;
    /**
     * Никнейм
     */
	@Column(name = "nickname", nullable = false, unique = true)
	private String nickname;
    /**
     * email
     */
	@Column(name = "email", nullable = false)
	private String email;
    /**
     * Пароль
     */
	@Column(name = "password", nullable = false)
	private String password;
    /**
     * Роль
     */
	@Column(name = "role", nullable = false)
	private String role;
    /**
     * Шахматный рейтинг
     */
	@Column(name = "rating", columnDefinition = "INTEGER DEFAULT 0")
	private int rating = 0;
    /**
     *  Отправленные запросы дружбы
     */
	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Friendship> sentFriendships = new ArrayList<>();
    /**
     * Полученные запросы дружбы
     */
	@JsonIgnore
	@OneToMany(mappedBy = "friend", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Friendship> receivedFriendships = new ArrayList<>();
    /**
     * Дата и время оздания профиля
     */
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    /**
     * Описание профиля
     */
	@Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    /**
     * День рождения
     */
	@Column(name = "birth_date")
	private LocalDate birthDate;
    /**
     * Пол
     */
	@Enumerated(EnumType.STRING)
	@Column(name = "sex")
	private Sex sex;
    /**
     * Аккаунт Телеграм
     */
	@Column(name = "telegram")
	private String telegram;
    /**
     * Аккаунт ВК
     */
	@Column(name = "vk")
	private String vk;
    /**
     * Уровень в шахматах
     */
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "rank_id")
	private Rank rank;
    /**
     * Языки, которые знает пользователь
     */
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<UserLanguage> languages = new ArrayList<>();
    /**
     * Список прогресса в уроках
     */
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserLessonProgress> lessonProgresses = new ArrayList<>();
    /**
     * Список прогресса в заданиях
     */
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserTaskProgress> taskProgresses = new ArrayList<>();
    /**
     * Является ли админом
     */
	@Column(name = "is_admin", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean isAdmin;
    /**
     * Заблокирован ли пользователь
     */
	@Column(name = "is_banned", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean isBanned;
    /**
     * Причина блока
     */
	@Column(name = "ban_reason")
	private String banReason;
    /**
     * Время, когда истекает бан
     */
	@Column(name = "ban_expires_at")
	private LocalDateTime banExpiresAt;

	public void addLanguage(String language, LanguageLevel level) {
		UserLanguage userLanguage = new UserLanguage();
		userLanguage.setUser(this);
		userLanguage.setLanguage(language);
		userLanguage.setLevel(level);
		this.languages.add(userLanguage);
	}

	public void removeLanguage(String language) {
		languages.removeIf(lang -> lang.getLanguage().equals(language));
	}

	public User(String nickname, String email, String password, String role) {
		this.nickname = nickname;
		this.email = email;
		this.password = password;
		this.role = role;
	}

	public void updateRating(int value) {
		this.rating += value;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + this.role));
	}

	@Override
	public String getUsername() {
		return this.nickname;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		if (isBanned) {
			return banExpiresAt != null && banExpiresAt.isBefore(LocalDateTime.now());
		}
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}