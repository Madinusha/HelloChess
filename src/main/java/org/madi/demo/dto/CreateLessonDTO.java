package org.madi.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.madi.demo.entities.Lesson.LessonType;

@Getter
@Setter
@NoArgsConstructor
public class CreateLessonDTO {
	private String title;
	private String description;
	private LessonType lessonType;
	private String image;
}