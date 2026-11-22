package org.madi.demo.service;

import io.micrometer.core.instrument.MeterRegistry;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class OnlineUsersService {
    private final Set<String> onlineUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    private final Set<String> activeCommunityUsers =
            Collections.newSetFromMap(new ConcurrentHashMap<>());

    public OnlineUsersService(MeterRegistry meterRegistry) {
        meterRegistry.gauge("chess.users.online", onlineUsers, Set::size);
    }

    public void userLoggedIn(String username) {
        onlineUsers.add(username);
    }

    public void userLoggedOut(String username) {
        onlineUsers.remove(username);
        activeCommunityUsers.remove(username);
    }

    public void userConnected(String username) {
        activeCommunityUsers.add(username);
    }

    public void userDisconnected(String username) {
        activeCommunityUsers.remove(username);
    }

    public List<String> getOnlineUsers() {
        return new ArrayList<>(onlineUsers);
    }

    public List<String> getActiveCommunityUsers() {
        return new ArrayList<>(activeCommunityUsers);
    }
}
