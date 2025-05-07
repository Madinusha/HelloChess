package org.madi.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.madi.demo.dto.ChessTaskData;
import org.madi.demo.dto.TaskCreateRequest;
import org.madi.demo.dto.TaskDTO;
import org.madi.demo.entities.Lesson;
import org.madi.demo.entities.Task;
import org.madi.demo.repository.LessonRepository;
import org.madi.demo.repository.TaskRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

	private final TaskRepository taskRepository;
	private final LessonRepository lessonRepository;
	private final ObjectMapper objectMapper;

	public List<TaskDTO> getTasksByLessonId(Long lessonId) {
		List<Task> tasks = taskRepository.findByLessonIdOrderByOrderAsc(lessonId);
		return tasks.stream()
				.map(this::convertToDto)
				.collect(Collectors.toList());
	}

	public TaskDTO getTaskById(Long taskId) {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task not found"));
		return convertToDto(task);
	}

	public TaskDTO createTask(TaskCreateRequest request, Long lessonId) {
		Lesson lesson = lessonRepository.findById(lessonId)
				.orElseThrow(() -> new EntityNotFoundException("Lesson not found"));

		int taskCount = (int) taskRepository.countByLessonId(lessonId);
		int newOrder = taskCount + 1;

		if (taskRepository.existsByLessonIdAndOrder(lessonId, newOrder)) {
			throw new RuntimeException("Task with this order already exists for the lesson");
		}

		Task task = new Task();
		task.setLesson(lesson);
		task.setDescription(request.getDescription());
		task.setOrder(newOrder);

		try {
			task.setChessData(objectMapper.writeValueAsString(request.getChessData()));
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to serialize chess data", e);
		}

		Task savedTask = taskRepository.save(task);
		return convertToDto(savedTask);
	}

	public void deleteTask(Long taskId) {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task not found"));

		Long lessonId = task.getLesson().getId();
		int deletedOrder = task.getOrder();

		taskRepository.delete(task);
		taskRepository.decrementOrdersAfterDeletion(lessonId, deletedOrder);
	}

	private TaskDTO convertToDto(Task task) {
		TaskDTO dto = new TaskDTO();
		dto.setId(task.getId());
		dto.setDescription(task.getDescription());
		dto.setOrder(task.getOrder());
		try {
			ChessTaskData chessData = objectMapper.readValue(task.getChessData(), ChessTaskData.class);
			dto.setChessData(chessData);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to parse chess data", e);
		}

		return dto;
	}
}