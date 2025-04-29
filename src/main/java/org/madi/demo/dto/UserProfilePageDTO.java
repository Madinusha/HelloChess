package org.madi.demo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfilePageDTO {
	private String nickname;
	private int rating;
	private String email;
	private String statusDetailed; // "none", "friend", "pending_outgoing", "pending_incoming", "declined"
	private String creationDate;

}
