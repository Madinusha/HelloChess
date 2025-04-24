package org.madi.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FriendRequestDTO {
	private Long id;
	private String senderNickname;
	private LocalDateTime createdAt;
	private String status;
}