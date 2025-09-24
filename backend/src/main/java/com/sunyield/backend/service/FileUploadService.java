package com.sunyield.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {
    
    private static final String UPLOAD_DIR = "uploads/projects/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"};
    
    public FileUploadService() {
        // Create upload directory if it doesn't exist
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory", e);
        }
    }
    
    public String uploadProjectImage(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = Paths.get(UPLOAD_DIR, filename);
        Files.copy(file.getInputStream(), filePath);
        
        // Return the relative path for database storage
        return UPLOAD_DIR + filename;
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isValidExtension = true;
                break;
            }
        }
        
        if (!isValidExtension) {
            throw new IllegalArgumentException("Only PNG, JPG, and JPEG files are allowed");
        }
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            throw new IllegalArgumentException("File must have an extension");
        }
        return filename.substring(lastDotIndex);
    }
    
    public void deleteProjectImage(String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                Path filePath = Paths.get(imageUrl);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            } catch (IOException e) {
                // Log error but don't throw exception
                System.err.println("Failed to delete image: " + imageUrl);
            }
        }
    }
} 