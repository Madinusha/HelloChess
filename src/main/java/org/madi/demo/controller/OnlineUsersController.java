package org.madi.demo.controller;

import org.madi.demo.service.OnlineUsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;

@Controller
public class OnlineUsersController {
	private static final Logger log = LoggerFactory.getLogger(OnlineUsersController.class);

	private final OnlineUsersService onlineUsersService;
	private final SimpMessagingTemplate messagingTemplate;

	@Autowired
	public OnlineUsersController(OnlineUsersService onlineUsersService,
								 SimpMessagingTemplate messagingTemplate) {
		this.onlineUsersService = onlineUsersService;
		this.messagingTemplate = messagingTemplate;
	}

	@MessageMapping("/user/online")
	@SendTo("/topic/online")
	public List<String> handleOnlineRequest(Principal principal) {
		if (principal != null) {
			String username = principal.getName();
			onlineUsersService.userLoggedIn(username);
			onlineUsersService.userConnected(username);
			log.info("User {} requested online list", username);
		}
		return onlineUsersService.getOnlineUsers();
	}

	@GetMapping("/api/user-online/list")
	@ResponseBody
	public List<String> getOnlineUsers() {
		return onlineUsersService.getOnlineUsers();
	}

	@EventListener
	public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
		if (event.getUser() != null) {
			String username = event.getUser().getName();
			onlineUsersService.userDisconnected(username);

			// Не удаляем из общего списка, только из активных на странице
			messagingTemplate.convertAndSend("/topic/online", onlineUsersService.getOnlineUsers());
		}
	}
}