package org.madi.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Прогресс пользователя в уроках
 */
@Entity
@Table(name = "user_lesson_progress", uniqueConstraints = {
		@UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class UserLessonProgress {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Пользователь
     */
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
    /**
     * Урок
     */
	@ManyToOne
	@JoinColumn(name = "lesson_id", nullable = false)
	private Lesson lesson;

    // todo Сделать колонками
    /**
     * Количество вполненных задач в уроке
     */
	private int completedTasksCount;
    /**
     * Итоговое количество звезд в уроке ( максимум 5 звезд)
     */
	private int totalStars;
}