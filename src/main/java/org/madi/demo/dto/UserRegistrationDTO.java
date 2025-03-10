package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegistrationDTO {
	private String nickname;
	private String password;
	private String email;
}