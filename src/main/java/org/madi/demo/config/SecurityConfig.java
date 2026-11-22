package org.madi.demo.config;

import lombok.RequiredArgsConstructor;
import org.madi.demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.remember-me-key}")
    private String rememberMeKey;

    /**
     * Management-порт (8081): метрики actuator доступны без авторизации, но только внутри кластера.
     */
    @Value("${management.server.port:8081}")
    private int managementPort;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder);
    }

    /** Первым проверяется management-порт: весь трафик на нём открыт, наружу он не публикуется. */
    @Bean
    @Order(1)
    public SecurityFilterChain managementFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(request -> request.getLocalPort() == managementPort)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(
                                                "/",
                                                "/actuator/health/**",
                                                "/actuator/info",
                                                "/registration",
                                                "/login",
                                                "/api/users/register",
                                                "/api/users/login",
                                                "/index",
                                                "/static/**",
                                                "/images/**",
                                                "/favicon.ico")
                                        .permitAll()
                                        .requestMatchers("/game")
                                        .authenticated()
                                        .requestMatchers("/api/admin/**")
                                        .hasRole("ADMIN")
                                        .anyRequest()
                                        .authenticated())
                .formLogin(
                        form ->
                                form.loginPage("/registration")
                                        .defaultSuccessUrl("/gameConstructor")
                                        .failureUrl("/login?error=true")
                                        .permitAll())
                .rememberMe(
                        remember ->
                                remember.key(rememberMeKey).tokenValiditySeconds(86400) // 1 день
                        )
                .logout(
                        logout ->
                                logout.logoutSuccessUrl("/registration")
                                        .permitAll()
                                        .invalidateHttpSession(true)
                                        .clearAuthentication(true)
                                        .addLogoutHandler(
                                                (request, response, authentication) -> {}))
                .csrf(
                        csrf ->
                                csrf.csrfTokenRepository(
                                                CookieCsrfTokenRepository.withHttpOnlyFalse())
                                        .ignoringRequestMatchers(
                                                "/ws/**") // Разрешить WebSocket без CSRF
                        )
                .exceptionHandling(
                        ex ->
                                ex.authenticationEntryPoint(
                                        new LoginUrlAuthenticationEntryPoint("/login")));

        return http.build();
    }
}
