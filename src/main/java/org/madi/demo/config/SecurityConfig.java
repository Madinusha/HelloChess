package org.madi.demo.config;
import org.madi.demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Autowired
	private CustomUserDetailsService customUserDetailsService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth
				.userDetailsService(customUserDetailsService)
				.passwordEncoder(passwordEncoder);
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.sessionManagement(session -> session
					.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
			)
			.authorizeHttpRequests(auth -> auth
					.requestMatchers(
							"/",
							"/registration",
							"/login",
							"/api/users/register",
							"/api/users/login",
							"/index",
							"/static/**",
							"/images/**",
							"/favicon.ico"
					).permitAll()
					.requestMatchers("/game").authenticated()
					.anyRequest().authenticated()
			)
			.formLogin(form -> form
					.loginPage("/registration")
					.defaultSuccessUrl("/gameConstructor")
					.failureUrl("/login?error=true")
					.permitAll()
			)
			.rememberMe(remember -> remember
					.key("uniqueAndSecretKey") // Секретный ключ
					.tokenValiditySeconds(86400) // 1 день
			)
			.logout(logout -> logout
					.logoutSuccessUrl("/registration")
					.permitAll()
					.invalidateHttpSession(true)
					.clearAuthentication(true)
					.addLogoutHandler((request, response, authentication) -> {})
			)
			.csrf(csrf -> csrf
					.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
					.ignoringRequestMatchers("/ws/**") // Разрешить WebSocket без CSRF
			)
			.exceptionHandling(ex -> ex
					.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
			);

		return http.build();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				.authorizeHttpRequests(auth -> auth
								.requestMatchers("/game").authenticated()
				)
				.formLogin(form -> form
						.loginPage("/login")
						.permitAll()
				);
		return http.build();
	}
}