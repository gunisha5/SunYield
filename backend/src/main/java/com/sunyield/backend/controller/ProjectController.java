package com.sunyield.backend.controller;

import com.sunyield.backend.entity.Project;
import com.sunyield.backend.repository.ProjectRepository;
import com.sunyield.backend.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private FileUploadService fileUploadService;

    // Fetch active projects
    @GetMapping("/active")
    @CrossOrigin(origins = "*")
    public List<Project> getActiveProjects() {
        return projectRepository.findByStatus("ACTIVE");
    }

    // Debug endpoint to check raw project data (Development only)
    @GetMapping("/debug")
    @CrossOrigin(origins = "*")
    @Profile("!prod")
    public List<Project> getDebugProjects() {
        try {
            List<Project> projects = projectRepository.findByStatus("ACTIVE");
            // Return projects without debug logging
            return projects;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // Simple test endpoint (Development only)
    @GetMapping("/test")
    @CrossOrigin(origins = "*")
    @Profile("!prod")
    public String testEndpoint() {
        return "API is working!";
    }

    // Health check endpoint
    @GetMapping("/health")
    @CrossOrigin(origins = "*")
    public String healthCheck() {
        return "Server is running!";
    }

    // Admin endpoints moved to AdminController

    // Admin image upload moved to AdminController

    // Serve project images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/projects/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin pause project moved to AdminController
} 