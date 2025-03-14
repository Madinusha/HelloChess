package org.madi.demo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<String> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
		// Проверяем наличие root cause
		Throwable rootCause = ex.getRootCause();
		String errorMessage = "Ошибка регистрации";

		if (rootCause != null) {
			String rootMsg = rootCause.getMessage().toLowerCase();
			if (rootMsg.contains("nickname") || rootMsg.contains("users_nickname_key")) {
				errorMessage = "Этот ник уже занят";
			} else if (rootMsg.contains("email") || rootMsg.contains("users_email_key")) {
				errorMessage = "Этот email уже зарегистрирован";
			}
		} else {
			// Анализируем сообщение самого исключения, если rootCause отсутствует
			String exceptionMsg = ex.getMessage().toLowerCase();
			if (exceptionMsg.contains("ник")) {
				errorMessage = "Этот ник уже занят";
			} else if (exceptionMsg.contains("email")) {
				errorMessage = "Этот email уже зарегистрирован";
			}
		}
		return ResponseEntity.badRequest().body(errorMessage);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleGeneralException(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Произошла ошибка. Попробуйте позже.");
	}

	// Обработка ошибок валидации
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
		assert ex.getBindingResult() != null;
		List<FieldError> errors = ex.getBindingResult().getFieldErrors();
		String errorMessage = errors.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.collect(Collectors.joining(", "));
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
	}

	// TODO добавить больше вариантов ошибок
}