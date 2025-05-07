package org.madi.demo.repository;

import org.madi.demo.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	// Найти все задачи для урока, отсортированные по порядку
	List<Task> findByLessonIdOrderByOrderAsc(Long lessonId);

	// Найти задачу по ID с проверкой принадлежности к уроку
	Optional<Task> findByIdAndLessonId(Long taskId, Long lessonId);

	// Проверить существование задачи по ID урока
	boolean existsByLessonId(Long lessonId);

	// Количество задач в уроке
	@Query("SELECT COUNT(t) FROM Task t WHERE t.lesson.id = :lessonId")
	long countByLessonId(@Param("lessonId") Long lessonId);

	boolean existsByLessonIdAndOrder(Long lessonId, int order);

	@Modifying
	@Query("UPDATE Task t SET t.order = t.order - 1 WHERE t.lesson.id = :lessonId AND t.order > :deletedOrder")
	void decrementOrdersAfterDeletion(@Param("lessonId") Long lessonId, @Param("deletedOrder") int deletedOrder);
}