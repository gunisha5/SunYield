package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.Project;
import com.solarcapital.backend.repository.ProjectRepository;
import com.solarcapital.backend.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private FileUploadService fileUploadService;

    // Fetch active projects
    @GetMapping("/active")
    public List<Project> getActiveProjects() {
        return projectRepository.findByStatus("ACTIVE");
    }

    // Admin: Create project
    @PostMapping("/admin")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        project.setStatus("ACTIVE");
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // Admin: Update project
    @PutMapping("/admin/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project updatedProject) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project project = opt.get();
        project.setName(updatedProject.getName());
        project.setLocation(updatedProject.getLocation());
        project.setEnergyCapacity(updatedProject.getEnergyCapacity());
        project.setSubscriptionPrice(updatedProject.getSubscriptionPrice());
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // Admin: Upload project image
    @PostMapping("/admin/{id}/image")
    public ResponseEntity<String> uploadProjectImage(@PathVariable Long id, @RequestParam("image") MultipartFile file) {
        try {
            Optional<Project> opt = projectRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.notFound().build();
            
            Project project = opt.get();
            
            // Delete old image if exists
            if (project.getImageUrl() != null) {
                fileUploadService.deleteProjectImage(project.getImageUrl());
            }
            
            // Upload new image
            String imageUrl = fileUploadService.uploadProjectImage(file);
            project.setImageUrl(imageUrl);
            projectRepository.save(project);
            
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

    // Admin: Pause project
    @PatchMapping("/admin/{id}/pause")
    public ResponseEntity<Project> pauseProject(@PathVariable Long id) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project project = opt.get();
        project.setStatus("PAUSED");
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }
} 