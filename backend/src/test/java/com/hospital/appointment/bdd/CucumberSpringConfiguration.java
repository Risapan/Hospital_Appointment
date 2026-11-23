package com.hospital.appointment.bdd;

import com.hospital.appointment.api.ApiTestSupport;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = ApiTestSupport.MONGO_URI)
public class CucumberSpringConfiguration {
}
