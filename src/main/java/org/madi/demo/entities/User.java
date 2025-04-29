package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class User implements UserDetails {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String nickname;

	@Column(nullable = false)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String role;

	@Column(columnDefinition = "INTEGER DEFAULT 0")
	private int rating = 0;

	// Отправленные запросы дружбы
	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Friendship> sentFriendships = new ArrayList<>();

	// Полученные запросы дружбы
	@JsonIgnore
	@OneToMany(mappedBy = "friend", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Friendship> receivedFriendships = new ArrayList<>();

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(columnDefinition = "TEXT")
	private String bio;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Enumerated(EnumType.STRING)
	@Column
	private Gender gender; // enum: MALE, FEMALE

	@Column
	private String telegram;

	@Column
	private String instagram;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "rank_id")
	private Rank rank;

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<UserLanguage> languages = new ArrayList<>();

	public void addLanguage(String language, UserLanguage.LanguageLevel level) {
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

	public enum Gender {
		MALE, FEMALE
	}
}