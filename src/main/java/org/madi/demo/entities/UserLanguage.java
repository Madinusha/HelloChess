package org.madi.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_languages")
@Getter
@Setter
@NoArgsConstructor
public class UserLanguage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@Column(nullable = false)
	private String language;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private LanguageLevel level;


	public enum LanguageLevel {
		NATIVE("родной"),
		ADVANCED("продвинутый"),
		INTERMEDIATE("средний"),
		BEGINNER("начальный");

		private final String displayName;

		LanguageLevel(String displayName) {
			this.displayName = displayName;
		}

		public String getDisplayName() {
			return displayName;
		}

		public static LanguageLevel fromDisplayName(String displayName) {
			for (LanguageLevel level : values()) {
				if (level.getDisplayName().equalsIgnoreCase(displayName)) {
					return level;
				}
			}
			throw new IllegalArgumentException("Unknown language level: " + displayName);
		}
	}
}

