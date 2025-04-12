package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatDTO {
	private String senderNickname;
	private String message;

	public ChatDTO(String sender, String message) {
		this.senderNickname = sender;
		this.message = message;
	}
}