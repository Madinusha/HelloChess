package org.madi.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class HelloChessApplication {
	public static void main(String[] args) {
		SpringApplication.run(HelloChessApplication.class, args);
	}
}
