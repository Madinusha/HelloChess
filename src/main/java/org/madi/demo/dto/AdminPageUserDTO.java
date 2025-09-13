package org.madi.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminPageUserDTO {
	private Long userId;
	private String nickname;
	private boolean isBanned;
	private boolean isAdmin;

}