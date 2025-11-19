package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.madi.demo.enums.LessonType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Таблица существующих уроков
 */
@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
public class Lesson {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Тип урока
     */
	@Enumerated(EnumType.STRING)
	@Column(name = "lesson_type", nullable = false)
	private LessonType lessonType;
    /**
     * Название
     */
	@Column(name = "title",nullable = false)
	private String title;
    /**
     * Описание
     */
	@Column(name = "description", columnDefinition = "TEXT")
	private String description;
    /**
     * Количество задач
     */
	@Column(name = "task_count")
	private int taskCount;
    /**
     * Дата и время создания
     */
	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
    /**
     * Спискок задач
     */
	@OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Task> tasks = new ArrayList<>();
    /**
     * Список пользовательского прогресса
     */
	@OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserLessonProgress> userProgresses = new ArrayList<>();
    /**
     * Ссылка на изображение
     */
	@Column(name = "image_url", columnDefinition = "TEXT")
	private String image;

	public Lesson(String title, String description, LessonType lessonType) {
		this.title = title;
		this.description = description;
		this.lessonType = lessonType;
	}
}

