package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;
import org.madi.demo.entities.UserLanguage;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProfileUpdateDTO {
	private String bio;
	private LocalDate birthDate;
	private Long rankId;
	private String gender;
	private List<String> languages;
	private List<String> languageLevels;
	private String telegram;
	private String vk;
}
