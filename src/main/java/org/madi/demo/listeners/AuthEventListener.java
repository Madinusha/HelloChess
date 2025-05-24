package org.madi.demo.listeners;

import lombok.RequiredArgsConstructor;
import org.madi.demo.service.OnlineUsersService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.event.AbstractAuthenticationEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.authentication.event.LogoutSuccessEvent;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthEventListener {

	private final OnlineUsersService onlineUsersService;
	private final SimpMessagingTemplate messagingTemplate;

	@EventListener
	public void handleAuthenticationSuccess(AbstractAuthenticationEvent event) {
		if (event instanceof AuthenticationSuccessEvent) {
			String username = event.getAuthentication().getName();
			onlineUsersService.userLoggedIn(username);
			sendOnlineListToAll();
		}
	}

	private void sendOnlineListToAll() {
		List<String> users = onlineUsersService.getOnlineUsers();
		messagingTemplate.convertAndSend("/topic/online", users);
	}

	@EventListener
	public void handleLogoutSuccessEvent(LogoutSuccessEvent event) {
		String username = event.getAuthentication().getName();
		onlineUsersService.userLoggedOut(username);
		messagingTemplate.convertAndSend("/topic/online", onlineUsersService.getOnlineUsers());
	}
}