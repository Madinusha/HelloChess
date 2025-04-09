package org.madi.demo.model;

import lombok.Getter;
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
	private boolean isWhiteTurn;
	private boolean isStopped = false; // Флаг завершения
	private boolean isTenthsMode = false; // Режим десятых долей секунды
	private static final long CRITICAL_TIME_THRESHOLD = 5000; // Порог переключения на десятые доли (5 секунд)

	public GameTimer(int initialTimeMinutes, int incrementSeconds) {
		this.initialTimeMinutes = initialTimeMinutes;
		this.incrementSeconds = incrementSeconds;
		this.whiteTime = initialTimeMinutes * 60 * 1000L; // минуты в миллисекунды
		this.blackTime = initialTimeMinutes * 60 * 1000L;
		this.increment = incrementSeconds * 1000L;
	}

	public void start() {
		if (isStopped) return;
		executor = new ScheduledThreadPoolExecutor(1); // Используем пул потоков
		scheduleTick(); // Начинаем с режима секунд
	}

	private void scheduleTick() {
		if (isTenthsMode) {
			// В режиме десятых долей вызываем tick() каждые 100 мс
			executor.scheduleAtFixedRate(this::tick, 100, 100, TimeUnit.MILLISECONDS);
		} else {
			// В обычном режиме вызываем tick() каждую секунду
			executor.scheduleAtFixedRate(this::tick, 1000, 1000, TimeUnit.MILLISECONDS);
		}
	}

	private void tick() {
		if (isStopped) return; // Если таймер остановлен, не уменьшаем время

		if (isWhiteTurn) {
			whiteTime = Math.max(whiteTime - getTickDuration(), 0);
		} else {
			blackTime = Math.max(blackTime - getTickDuration(), 0);
		}

		checkTimeout();
		checkTenthsMode();
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

	public void switchTurn() {
		if (isStopped) return; // Если таймер остановлен, не переключаем
		if (isWhiteTurn) {
			whiteTime += increment;
		} else {
			blackTime += increment;
		}
		isWhiteTurn = !isWhiteTurn;
	}

	public void stop() {
		stopExecutor();
		isStopped = true; // Устанавливаем флаг завершения
	}

	private void stopExecutor() {
		if (executor != null) {
			executor.shutdownNow();
		}
	}

	private void checkTimeout() {
		if (whiteTime <= 0 || blackTime <= 0) {
			stop();
			endGame(isWhiteTurn ? "BLACK" : "WHITE"); // Уведомляем о победе противника
		}
	}

	private void endGame(String winner) {
		System.out.println("Game over! Winner: " + winner + ". Reason: timeout.");
	}

	public String getFormattedTime(boolean isWhite) {
		long time = isWhite ? whiteTime : blackTime;
		long minutes = time / 60000;
		long seconds = (time % 60000) / 1000;
		long tenths = (time % 1000) / 100; // Десятые доли секунды
		return String.format("%02d:%02d.%d", minutes, seconds, tenths);
	}
}