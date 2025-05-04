package org.madi.demo.dto;

import lombok.Data;
import org.madi.demo.entities.Lesson;

@Data
public class LessonDTO {
	private Long id;
	private Lesson.LessonType lessonType;
	private String title;
	private String description;
	private int progress;
	private int score;
	private String image;
}
