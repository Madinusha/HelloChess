package org.madi.demo.model;

import lombok.Getter;
import org.madi.demo.service.ChessService;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Map;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Getter
public class GameTimer {
	private long whiteTime; // В миллисекундах
	private long blackTime; // В миллисекундах
	private final int initialTimeMinutes;
	private final int incrementSeconds;
	private final long increment; // В миллисекундах
	private ScheduledExecutorService executor;
	private boolean isWhiteTurn = true;
	private boolean isStopped = false; // Флаг завершения
	private boolean timerActive = false;
	private boolean isTenthsMode = false; // Режим десятых долей секунды
	private static final long CRITICAL_TIME_THRESHOLD = 5000; // Порог переключения на десятые доли (5 секунд)
	private final SimpMessagingTemplate messagingTemplate;
	private final String sessionId;

	private final ChessService chessService;

	public GameTimer(int initialTimeMinutes, int incrementSeconds, SimpMessagingTemplate messagingTemplate, String sessionId, ChessService chessService) {
		this.initialTimeMinutes = initialTimeMinutes;
		this.incrementSeconds = incrementSeconds;
		this.whiteTime = initialTimeMinutes * 60 * 1000L; // минуты в миллисекунды
		this.blackTime = initialTimeMinutes * 60 * 1000L;
		this.increment = incrementSeconds * 1000L;

		this.messagingTemplate = messagingTemplate;
		this.sessionId = sessionId;
		this.chessService = chessService;
	}

	public void start() {
		if (isStopped) return;
		timerActive = true;
		executor = new ScheduledThreadPoolExecutor(1); // Используем пул потоков
		scheduleTick(); // Начинаем с режима секунд
	}

	private void scheduleTick() {
		if (isTenthsMode) {
			executor.scheduleAtFixedRate(this::tick, 100, 100, TimeUnit.MILLISECONDS);
		} else {
			executor.scheduleAtFixedRate(this::tick, 1000, 1000, TimeUnit.MILLISECONDS);
		}
	}

	private long lastSentTime = 0;
	private void tick() {
		if (isStopped) return;

		if (isWhiteTurn) {
			whiteTime = Math.max(whiteTime - getTickDuration(), 0);
		} else {
			blackTime = Math.max(blackTime - getTickDuration(), 0);
		}

		checkTimeout();
		checkTenthsMode();
		long currentTime = System.currentTimeMillis();
		if (currentTime - lastSentTime >= 5000) {
			sendTimeToClients();
			lastSentTime = currentTime;
		}
	}

	private void sendTimeToClients() {
		Map<String, Object> timeData = Map.of(
				"whiteTime", getFormattedTime(true),
				"blackTime", getFormattedTime(false),
				"timerActive", timerActive
		);
		messagingTemplate.convertAndSend("/topic/game/" + sessionId + "/timer", timeData);
	}

	private long getTickDuration() {
		return isTenthsMode ? 100 : 1000; // Возвращаем 100 мс или 1000 мс в зависимости от режима
	}

	private void checkTenthsMode() {
		// Если время одного из игроков <= порогового значения, переключаемся в режим десятых долей
		if (!isTenthsMode && (whiteTime <= CRITICAL_TIME_THRESHOLD || blackTime <= CRITICAL_TIME_THRESHOLD)) {
			isTenthsMode = true;
			stopExecutor(); // Останавливаем текущий executor
			executor = new ScheduledThreadPoolExecutor(1); // Создаем новый executor
			scheduleTick(); // Переключаемся на режим десятых долей
		}
	}

	public void switchTurnWithIncrement() {
		if (isStopped) return; // Если таймер остановлен, не переключаем
		if (isWhiteTurn) {
			whiteTime += increment;
		} else {
			blackTime += increment;
		}
		isWhiteTurn = !isWhiteTurn;
	}

	public void switchTurn() {
		isWhiteTurn = !isWhiteTurn;
	}

	public void stop() {
		stopExecutor();
		isStopped = true;
		timerActive = false;
		sendTimeToClients();
	}

	private void stopExecutor() {
		if (executor != null) {
			executor.shutdownNow();
		}
	}

	private void checkTimeout() {
		if (whiteTime <= 0) {
			stop();
			chessService.endGameWithTimeout(sessionId, "WHITE");
		} else if (blackTime <= 0) {
			stop();
			chessService.endGameWithTimeout(sessionId, "BLACK");
		}
	}

	public String getFormattedTime(boolean isWhite) {
		long time = isWhite ? whiteTime : blackTime;
		long minutes = time / 60000;
		long seconds = (time % 60000) / 1000;
		long tenths = (time % 1000) / 100; // Десятые доли секунды
		return String.format("%02d:%02d.%d", minutes, seconds, tenths);
	}
}