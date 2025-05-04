package org.madi.demo.repository;

import org.madi.demo.entities.Lesson;
import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
	List<Lesson> findByLessonType(Lesson.LessonType lessonType);
}