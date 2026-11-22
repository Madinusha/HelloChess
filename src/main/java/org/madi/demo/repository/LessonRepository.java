package org.madi.demo.repository;

import java.util.List;
import java.util.Optional;
import org.madi.demo.entities.Lesson;
import org.madi.demo.enums.LessonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLessonType(LessonType lessonType);

    @Query("SELECT l FROM Lesson l LEFT JOIN FETCH l.tasks WHERE l.id = :lessonId")
    Optional<Lesson> findByIdWithTasks(@Param("lessonId") Long lessonId);
}
