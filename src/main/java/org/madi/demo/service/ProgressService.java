package org.madi.demo.service;

import jakarta.persistence.EntityNotFoundException;
import org.madi.demo.entities.*;
import org.madi.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

	private final UserLessonProgressRepository lessonProgressRepository;
	private final UserTaskProgressRepository taskProgressRepository;
	private final LessonRepository lessonRepository;

	public ProgressService(
			UserLessonProgressRepository lessonProgressRepo,
			UserTaskProgressRepository taskProgressRepo, LessonRepository lessonRepository
	) {
		this.lessonProgressRepository = lessonProgressRepo;
		this.taskProgressRepository = taskProgressRepo;
		this.lessonRepository = lessonRepository;
	}

	@Transactional
	public void updateTaskProgress(User user, Task task, int stars) {
		stars = Math.max(0, Math.min(3, stars));

		// 1. Обновляем прогресс по задаче
		UserTaskProgress taskProgress = taskProgressRepository.findByUserAndTask(user, task)
				.orElseGet(UserTaskProgress::new);

		taskProgress.setUser(user);
		taskProgress.setTask(task);
		taskProgress.setStars(stars);
		taskProgressRepository.save(taskProgress);

		// 2. Загружаем урок вместе с задачами (JOIN FETCH)
		Lesson lesson = lessonRepository.findByIdWithTasks(task.getLesson().getId())
				.orElseThrow(() -> new EntityNotFoundException("Lesson not found"));

		// 3. Обновляем прогресс урока
		UserLessonProgress lessonProgress = lessonProgressRepository.findByUserAndLesson(user, lesson)
				.orElseGet(UserLessonProgress::new);

		// 4. Пересчитываем количество выполненных задач
		if (stars > 0 && (taskProgress.getStars() == 0 || taskProgress.getStars() < stars)) {
			lessonProgress.setCompletedTasksCount(lessonProgress.getCompletedTasksCount() + 1);
		}


		// 5. Пересчитываем общее количество звезд по всем задачам урока
		List<Task> tasksInLesson = lesson.getTasks();

		List<UserTaskProgress> userTaskProgresses = taskProgressRepository.findByUserAndTaskIn(user, tasksInLesson);
		int completedTasks = (int) userTaskProgresses.stream()
				.filter(p -> p.getStars() > 0)
				.count();

		lessonProgress.setCompletedTasksCount(completedTasks);

		int totalStars = taskProgressRepository.findByUserAndTaskIn(user, tasksInLesson)
				.stream()
				.mapToInt(UserTaskProgress::getStars)
				.sum();

		lessonProgress.setTotalStars(Math.min(totalStars, 5));
		lessonProgress.setUser(user);
		lessonProgress.setLesson(lesson);
		lessonProgressRepository.save(lessonProgress);
	}

	/**
	 * Получает прогресс пользователя по уроку
	 * @param user Пользователь
	 * @param lesson Урок
	 * @return Прогресс пользователя по уроку
	 */
	public Optional<UserLessonProgress> getLessonProgress(User user, Lesson lesson) {
		return lessonProgressRepository.findByUserAndLesson(user, lesson);
	}

	/**
	 * Получает прогресс пользователя по задаче
	 * @param user Пользователь
	 * @param task Задача
	 * @return Прогресс пользователя по задаче
	 */
	public Optional<UserTaskProgress> getTaskProgress(User user, Task task) {
		return taskProgressRepository.findByUserAndTask(user, task);
	}

	/**
	 * Получает прогресс пользователя по всем урокам
	 * @param user Пользователь
	 * @return Список прогрессов по урокам
	 */
	public List<UserLessonProgress> getAllLessonProgresses(User user) {
		return lessonProgressRepository.findByUser(user);
	}

	/**
	 * Получает прогресс пользователя по всем задачам урока
	 * @param user Пользователь
	 * @param lesson Урок
	 * @return Список прогрессов по задачам
	 */
	public List<UserTaskProgress> getAllTaskProgresses(User user, Lesson lesson) {
		return taskProgressRepository.findByUserAndTaskIn(user, lesson.getTasks());
	}
}