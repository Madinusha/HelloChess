package org.madi.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.madi.demo.dto.TaskCreateRequest;
import org.madi.demo.dto.TaskDTO;
import org.madi.demo.model.Position;
import org.madi.demo.service.ChessService;
import org.madi.demo.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lessons/{lessonId}/tasks")
@RequiredArgsConstructor
public class TaskController {

	private final TaskService taskService;
	private final ChessService chessService;


	@GetMapping
	public List<TaskDTO> getLessonTasks(@PathVariable Long lessonId) {
		return taskService.getTasksByLessonId(lessonId);
	}

	@GetMapping("/{taskId}")
	public TaskDTO getTask(
			@PathVariable Long lessonId,
			@PathVariable Long taskId) {
		return taskService.getTaskById(taskId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TaskDTO createTask(
			@PathVariable Long lessonId,
			@Valid @RequestBody TaskCreateRequest request) {
		return taskService.createTask(request, lessonId);
	}

	@PostMapping("/possible-move")
	public Map<String, Object> getPossibleMovesForOnePiece(
			@RequestBody Map<String, Object> request) {

		String position = (String) request.get("position");
		@SuppressWarnings("unchecked")
		Map<String, Map<String, Object>> clientData =
				(Map<String, Map<String, Object>>) request.get("clientData");

		List<Position> possibleMoves = chessService.getPossibleMovesForOnePiece(position, clientData);

		return Map.of(
				"position", position,
				"possibleMoves", possibleMoves
		);
	}

	@DeleteMapping("/{taskId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteTask(@PathVariable Long lessonId, @PathVariable Long taskId) {
		taskService.deleteTask(taskId);
		return ResponseEntity.noContent().build();
	}
}
