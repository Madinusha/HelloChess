package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_task_progress", uniqueConstraints = {
		@UniqueConstraint(columnNames = {"user_id", "task_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class UserTaskProgress {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne
	@JoinColumn(name = "task_id", nullable = false)
	private Task task;

	private int stars; // Звезды за задачу (0-3)
}