package org.madi.demo.repository;

import org.madi.demo.entities.Lesson;
import org.madi.demo.entities.User;
import org.madi.demo.entities.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
	Optional<UserLessonProgress> findByUserAndLesson(User user, Lesson lesson);
	List<UserLessonProgress> findByUser(User user);
}