package org.madi.demo.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

/**
 * Бизнес-метрики приложения в доменной области шахмат. Все счётчики собираются в Micrometer и
 * экспортируются в формате Open Metrics через /actuator/prometheus.
 */
@Component
public class AppMetrics {

    private final MeterRegistry registry;

    public AppMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    /** Создана новая партия (сессия игры). */
    public void gameCreated() {
        counter("chess.games.created").increment();
    }

    /** Партия завершена: result — white | black | draw | other. */
    public void gameFinished(String result) {
        counter("chess.games.finished", "result", normalizeResult(result)).increment();
    }

    /** Сделан ход в любой из партий. */
    public void moveMade() {
        counter("chess.moves").increment();
    }

    /** Успешная авторизация. */
    public void loginSuccess() {
        counter("chess.logins", "result", "success").increment();
    }

    /** Неудачная попытка авторизации. */
    public void loginFailure() {
        counter("chess.logins", "result", "failure").increment();
    }

    /** Зарегистрирован новый пользователь. */
    public void userRegistered() {
        counter("chess.users.registered").increment();
    }

    /** Отправлена заявка в друзья. */
    public void friendRequestSent() {
        counter("chess.friendship.requests").increment();
    }

    /** Заявка в друзья принята. */
    public void friendRequestAccepted() {
        counter("chess.friendship.requests.accepted").increment();
    }

    /** Выполнено задание урока (stars: 0-3, считаем только успешные). */
    public void lessonTaskCompleted(int stars) {
        counter("chess.lessons.tasks.completed", "stars", String.valueOf(stars)).increment();
    }

    private Counter counter(String name, String... tags) {
        return registry.counter(name, tags);
    }

    private String normalizeResult(String result) {
        if ("WHITE".equalsIgnoreCase(result)) {
            return "white";
        }
        if ("BLACK".equalsIgnoreCase(result)) {
            return "black";
        }
        if ("DRAW".equalsIgnoreCase(result)) {
            return "draw";
        }
        return "other";
    }
}
