package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * рогресс пользователя в задаче
 */
@Entity
@Table(name = "user_task_progress", uniqueConstraints = {
		@UniqueConstraint(columnNames = {"user_id", "task_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class UserTaskProgress {
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
     * Задача
     */
	@ManyToOne
	@JoinColumn(name = "task_id", nullable = false)
	private Task task;

    // todo сделать колонкой
    /**
     * Звезд на задачу (0-3)
     */
	private int stars;
}