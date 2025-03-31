package org.madi.demo.model;

import lombok.Getter;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Getter
public class GameTimer {
	private int whiteTime; // В секундах
	private int blackTime; // В секундах
	private final int increment; // В секундах
	private ScheduledExecutorService executor;
	private boolean isWhiteTurn;

	public GameTimer(int initialTime, int increment) {
		this.whiteTime = initialTime;
		this.blackTime = initialTime;
		this.increment = increment;
	}

	public void start() {
		executor = Executors.newSingleThreadScheduledExecutor();
		executor.scheduleAtFixedRate(this::tick, 1, 1, TimeUnit.SECONDS);
	}

	private void tick() {
		if (isWhiteTurn) {
			whiteTime--;
		} else {
			blackTime--;
		}
		checkTimeout();
	}

	public void switchTurn() {
		if (isWhiteTurn) {
			whiteTime += increment;
		} else {
			blackTime += increment;
		}
		isWhiteTurn = !isWhiteTurn;
	}

	private void checkTimeout() {
		if (whiteTime <= 0 || blackTime <= 0) {
			stop();
			// Логика обработки таймаута
		}
	}

	public void stop() {
		if (executor != null) {
			executor.shutdownNow();
		}
	}

	public String getFormattedWhiteTime() {
		return formatTime(whiteTime);
	}

	public String getFormattedBlackTime() {
		return formatTime(blackTime);
	}

	private String formatTime(int seconds) {
		return String.format("%02d:%02d", seconds / 60, seconds % 60);
	}
}