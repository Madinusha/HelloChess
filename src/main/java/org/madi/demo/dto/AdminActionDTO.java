package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminActionDTO {
	private Long userId;
	private String action; // "ban", "unban", "make_admin", "remove_admin"
	private Integer banDuration; // в минутах
	private String banReason;

}