package org.madi.demo.controller;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.madi.demo.entities.Task;
import org.madi.demo.entities.User;
import org.madi.demo.entities.UserLessonProgress;
import org.madi.demo.repository.TaskRepository;
import org.madi.demo.repository.UserRepository;
import org.madi.demo.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

	private final ProgressService progressService;
	private final UserRepository userRepository;
	private final TaskRepository taskRepository;

	@PostMapping("/task")
	public ResponseEntity<Void> saveTaskProgress(
			@RequestParam Long userId,
			@RequestParam Long taskId,
			@RequestParam int stars) {

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found"));

		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task not found"));

		progressService.updateTaskProgress(user, task, stars);

		return ResponseEntity.ok().build();
	}

	@GetMapping("/lesson-progress")
	public List<UserLessonProgress> getLessonProgress(@RequestParam Long userId) {
		return progressService.getAllLessonProgresses(userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found")));
	}
}