package org.madi.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {

	@NotBlank(message = "Имя пользователя не может быть пустым.")
	@Size(min = 3, max = 20, message = "Никнейм должен содержать 3-20 символов.")
	private String nickname;

	@NotBlank(message = "Email не может быть пустым.")
	@Email(message = "Неверный формат email.")
	private String email;

	private int rating;
}