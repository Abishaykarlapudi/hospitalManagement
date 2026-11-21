package com.vcube.HospitalManagement.DocTime.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class SpaWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        // API endpoints should not fallback to index.html
                        if (resourcePath.startsWith("auth/") || resourcePath.startsWith("doctor/")
                                || resourcePath.startsWith("patient/") || resourcePath.startsWith("hospital/")
                                || resourcePath.startsWith("appointments/") || resourcePath.startsWith("departments/")
                                || resourcePath.startsWith("api/")) {
                            return null;
                        }
                        // Fallback to index.html for SPA routes (e.g. /, /doctor, /patient, /hospital)
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
