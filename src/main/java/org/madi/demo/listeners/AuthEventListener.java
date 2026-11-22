package org.madi.demo.listeners;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.madi.demo.metrics.AppMetrics;
import org.madi.demo.service.OnlineUsersService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.event.AbstractAuthenticationEvent;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.authentication.event.LogoutSuccessEvent;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthEventListener {

    private final OnlineUsersService onlineUsersService;
    private final SimpMessagingTemplate messagingTemplate;
    private final AppMetrics appMetrics;

    @EventListener
    public void handleAuthenticationSuccess(AbstractAuthenticationEvent event) {
        if (event instanceof AuthenticationSuccessEvent) {
            String username = event.getAuthentication().getName();
            onlineUsersService.userLoggedIn(username);
            appMetrics.loginSuccess();
            sendOnlineListToAll();
        }
    }

    @EventListener
    public void handleAuthenticationFailure(AbstractAuthenticationFailureEvent event) {
        appMetrics.loginFailure();
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
