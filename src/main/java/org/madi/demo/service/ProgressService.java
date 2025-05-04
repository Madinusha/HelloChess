package org.madi.demo.service;

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

	public ProgressService(
			UserLessonProgressRepository lessonProgressRepo,
			UserTaskProgressRepository taskProgressRepo
	) {
		this.lessonProgressRepository = lessonProgressRepo;
		this.taskProgressRepository = taskProgressRepo;
	}

	/**
	 * Обновляет прогресс пользователя по задаче и связанному уроку
	 * @param user Пользователь
	 * @param task Задача
	 * @param stars Количество звезд за задачу (0-3)
	 */
	@Transactional
	public void updateTaskProgress(User user, Task task, int stars) {
		// Ограничиваем звезды диапазоном 0-3
		stars = Math.max(0, Math.min(3, stars));

		// Получаем или создаем прогресс по задаче
		UserTaskProgress taskProgress = taskProgressRepository.findByUserAndTask(user, task)
				.orElseGet(UserTaskProgress::new);

		taskProgress.setUser(user);
		taskProgress.setTask(task);
		taskProgress.setStars(stars);
		taskProgressRepository.save(taskProgress);

		// Обновляем прогресс урока
		Lesson lesson = task.getLesson();
		UserLessonProgress lessonProgress = lessonProgressRepository.findByUserAndLesson(user, lesson)
				.orElseGet(UserLessonProgress::new);

		// Обновляем количество выполненных задач
		if (taskProgress.getStars() > 0 && (taskProgress.getStars() - taskProgress.getStars()) > 0) {
			lessonProgress.setCompletedTasksCount(lessonProgress.getCompletedTasksCount() + 1);
		}

		// Пересчитываем общее количество звезд в уроке
		int totalStars = taskProgressRepository.findByUserAndTaskIn(user, lesson.getTasks())
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