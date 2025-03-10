//package org.madi.demo.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//	@Bean
//	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//		http
//				.authorizeHttpRequests(authorize -> authorize
//						.requestMatchers("/registrarion", "/registrarion/**").permitAll() // Разрешаем доступ к странице регистрации без аутентификации
//						.anyRequest().authenticated() // Все остальные запросы требуют аутентификации
//				)
//				.formLogin(formLogin -> formLogin
//						.loginPage("/registrarion") // Указываем свою страницу логина
//						.permitAll()
//				)
//				.logout(logout -> logout
//						.permitAll()
//				);
//
//		return http.build();
//	}
//}