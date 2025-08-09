package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.Project;
import com.solarcapital.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectRepository projectRepository;

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