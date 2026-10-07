package com.hortitech.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		config.addAllowedOrigin("*");
		config.addAllowedHeader("*");
		config.addAllowedMethod("*");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/api/alerta", config);
		source.registerCorsConfiguration("/api/camaraFria", config);
		source.registerCorsConfiguration("/api/colaboradores", config);
		source.registerCorsConfiguration("/api/registroTermico", config);
		source.registerCorsConfiguration("/api/usuarios/**", config);

		return new CorsFilter((CorsConfigurationSource) source);
	}

}
