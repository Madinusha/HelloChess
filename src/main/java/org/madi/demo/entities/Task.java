package org.madi.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.hibernate.type.descriptor.jdbc.JsonJdbcType;
import org.madi.demo.dto.ChessTaskData;

import java.util.ArrayList;
import java.util.List;

/**
 * Задача
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
public class Task {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Описание задачи
     */
	@Column(name = "description", columnDefinition = "TEXT")
	private String description;
    /**
     * Номер задачи в уроке
     */
	@Column(name = "task_order", nullable = false)
	private int order;
    /**
     * Начальная шахматная доска
     */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "chess_data", columnDefinition = "jsonb")
	private String chessData;
    /**
     * Родительский урок
     */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lesson_id", nullable = false)
	private Lesson lesson;
    /**
     * Список прогресс пользователей
     */
	@OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserTaskProgress> userProgresses = new ArrayList<>();
}
