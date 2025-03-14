package org.madi.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginDTO {
	@NotNull
	@Size(min = 3, max = 20)
	private String nickname;

	@NotNull
	@Size(min = 8)
	private String password;
}
