package org.madi.demo.controller;

import org.madi.demo.dto.CreateLessonDTO;
import org.madi.demo.dto.LessonDTO;
import org.madi.demo.entities.User;
import org.madi.demo.repository.UserRepository;
import org.madi.demo.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

	private final LessonService lessonService;
	private final UserRepository userRepository;

	public LessonController(LessonService lessonService, UserRepository userRepository) {
		this.lessonService = lessonService;
		this.userRepository = userRepository;
	}

	@PostMapping
	public ResponseEntity<LessonDTO> createLesson(
			@RequestBody CreateLessonDTO dto
	) {
		LessonDTO createdLesson = lessonService.createLesson(dto);
		return ResponseEntity.ok(createdLesson);
	}

	@PutMapping("/{id}")
	public ResponseEntity<LessonDTO> updateLesson(
			@PathVariable Long id,
			@RequestBody CreateLessonDTO dto
	) {
		LessonDTO updated = lessonService.updateLesson(id, dto);
		return ResponseEntity.ok(updated);
	}

	@GetMapping("/{id}")
	public ResponseEntity<LessonDTO> getLesson(@PathVariable Long id) {
		LessonDTO lesson = lessonService.getLessonById(id);
		return ResponseEntity.ok(lesson);
	}

	@GetMapping
	public ResponseEntity<List<LessonDTO>> getAllLessons() {
		return ResponseEntity.ok(lessonService.getAllLessons());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
		lessonService.deleteLesson(id);
		return ResponseEntity.noContent().build();
	}
}