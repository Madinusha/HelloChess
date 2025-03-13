package org.madi.demo.config;
import org.madi.demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private CustomUserDetailsService customUserDetailsService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.getSharedObject(AuthenticationManagerBuilder.class)
			.userDetailsService(customUserDetailsService)
			.passwordEncoder(passwordEncoder);

		http
//				.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(auth -> auth
					.requestMatchers("/registration", "/login", "/api/users/profile", "/api/users/register", "/api/users/login", "/**").permitAll()
					.anyRequest().authenticated()
			)
			.formLogin(form -> form
					.loginPage("/registration")
					.defaultSuccessUrl("/game")
					.permitAll()
			)
			.logout(logout -> logout
					.logoutSuccessUrl("/registration")
					.permitAll()
			);

		return http.build();
	}
}