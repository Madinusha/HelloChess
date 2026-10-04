package org.madi.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.madi.demo.enums.LanguageLevel;

/** Язык пользователя и его уровень */
@Entity
@Table(name = "user_languages")
@Getter
@Setter
@NoArgsConstructor
public class UserLanguage {
    /** id */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Пользователь */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /** Язык */
    @Column(name = "language", nullable = false)
    private String language;

    /** Уровень знания */
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private LanguageLevel level;
}
