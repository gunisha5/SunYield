package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.KYC;
import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.repository.KYCRepository;
import com.solarcapital.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/kyc")
public class KycController {
    @Autowired
    private KYCRepository kycRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitKyc(
            @RequestParam("documentType") String documentType,
            @RequestParam("documentNumber") String documentNumber,
            @RequestParam("document") MultipartFile document) {
        
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        
        // Check if user already has a KYC record
        KYC existingKyc = kycRepository.findByUserId(user.getId());
        if (existingKyc != null) {
            if (existingKyc.getStatus() == com.solarcapital.backend.entity.KYCStatus.PENDING) {
                return ResponseEntity.badRequest().body("KYC already submitted and pending approval");
            }
            if (existingKyc.getStatus() == com.solarcapital.backend.entity.KYCStatus.APPROVED) {
                return ResponseEntity.badRequest().body("KYC already approved");
            }
        }
        
        try {
            // Save the uploaded file (you might want to save to a file system or cloud storage)
            String fileName = document.getOriginalFilename();
            // For now, we'll just store the filename
            String documentPath = fileName; // In production, save to proper storage
            
            // Create new KYC record
            KYC kyc = new KYC();
            kyc.setUser(user);
            kyc.setPan(documentNumber); // Using pan field for document number
            kyc.setDocumentPath(documentPath);
            kyc.setStatus(com.solarcapital.backend.entity.KYCStatus.PENDING);
            
            kycRepository.save(kyc);
            
            return ResponseEntity.ok("KYC submitted successfully and pending approval");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to submit KYC: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getKycStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        KYC kyc = kycRepository.findByUserId(user.getId());
        
        if (kyc == null) {
            return ResponseEntity.ok(null); // No KYC submitted
        }
        
        return ResponseEntity.ok(kyc);
    }
} 