package com.example.roflparser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RoflparserApplication {

	public static void main(String[] args) {
		SpringApplication.run(RoflparserApplication.class, args);
	}

}
