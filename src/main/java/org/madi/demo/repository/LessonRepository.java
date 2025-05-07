package org.madi.demo.repository;

import org.madi.demo.entities.Lesson;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
	List<Lesson> findByLessonType(Lesson.LessonType lessonType);
	@Query("SELECT l FROM Lesson l LEFT JOIN FETCH l.tasks WHERE l.id = :lessonId")
	Optional<Lesson> findByIdWithTasks(@Param("lessonId") Long lessonId);
}