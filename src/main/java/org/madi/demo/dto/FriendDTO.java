package org.madi.demo.dto;

import lombok.Data;

@Data
public class FriendDTO {
	private String nickname;
	private int rating;
	private String statusDetailed; // "none", "friend", "pending_outgoing", "pending_incoming", "declined"
}