package org.madi.demo.service;

import org.madi.demo.dto.CreateLessonDTO;
import org.madi.demo.dto.LessonDTO;
import org.madi.demo.entities.Lesson;
import org.madi.demo.entities.User;
import org.madi.demo.repository.LessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

	private final LessonRepository lessonRepository;

	public LessonService(LessonRepository lessonRepository) {
		this.lessonRepository = lessonRepository;
	}

	public LessonDTO createLesson(CreateLessonDTO dto) {
		Lesson lesson = new Lesson();
		lesson.setTitle(dto.getTitle());
		lesson.setDescription(dto.getDescription());
		lesson.setLessonType(dto.getLessonType());
		lesson.setImage(dto.getImage());
		lesson = lessonRepository.save(lesson);
		return mapToDTO(lesson);
	}

	public Optional<LessonDTO> getLessonById(Long id) {
		return lessonRepository.findById(id).map(this::mapToDTO);
	}

	public List<LessonDTO> getAllLessons() {
		return lessonRepository.findAll().stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	public List<LessonDTO> getLessonsByType(Lesson.LessonType lessonType) {
		return lessonRepository.findByLessonType(lessonType).stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	public void deleteLesson(Long lessonId) {
		if (!lessonRepository.existsById(lessonId)) {
			throw new RuntimeException("Урок не найден");
		}
		lessonRepository.deleteById(lessonId);
	}

	public LessonDTO updateLesson(Long id, CreateLessonDTO dto) {
		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Урок не найден"));

		lesson.setTitle(dto.getTitle());
		lesson.setDescription(dto.getDescription());
		lesson.setLessonType(dto.getLessonType());
		lesson.setImage(dto.getImage());

		return mapToDTO(lessonRepository.save(lesson));
	}

	private LessonDTO mapToDTO(Lesson lesson) {
		LessonDTO dto = new LessonDTO();
		dto.setId(lesson.getId());
		dto.setLessonType(lesson.getLessonType());
		dto.setTitle(lesson.getTitle());
		dto.setDescription(lesson.getDescription());
		dto.setImage(lesson.getImage());
		dto.setProgress(0);
		return dto;
	}
}