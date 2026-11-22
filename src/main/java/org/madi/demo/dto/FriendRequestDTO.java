package org.madi.demo.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class FriendRequestDTO {
    private Long id;
    private String senderNickname;
    private LocalDateTime createdAt;
    private String status;
}
