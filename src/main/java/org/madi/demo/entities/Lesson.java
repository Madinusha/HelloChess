package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
public class Lesson {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "lesson_type", nullable = false)
	private LessonType lessonType;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "task_count")
	private int taskCount;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Task> tasks = new ArrayList<>();

	@OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserLessonProgress> userProgresses = new ArrayList<>();

	@Column(name = "image_url", columnDefinition = "TEXT")
	private String image;

	public Lesson(String title, String description, LessonType lessonType) {
		this.title = title;
		this.description = description;
		this.lessonType = lessonType;
	}

	public enum LessonType {
		PIECE_TECHNIQUE,
		ADVANCED_LEVEL,
		TACTICS
	}
}

