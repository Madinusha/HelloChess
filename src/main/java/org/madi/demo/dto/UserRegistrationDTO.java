package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;

@Getter
@Setter
public class UserRegistrationDTO {
	@NotNull
	@Size(min = 3, max = 20)
	private String nickname;

	@NotNull
	@Size(min = 8)
	private String password;

	@NotNull
	@Email
	private String email;
}