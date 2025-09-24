package com.sunyield.backend.controller;

import com.sunyield.backend.entity.KYC;
import com.sunyield.backend.entity.KYCStatus;
import com.sunyield.backend.entity.User;
import com.sunyield.backend.repository.KYCRepository;
import com.sunyield.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/admin/kyc")
public class AdminKycController {
    @Autowired
    private KYCRepository kycRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveKyc(@PathVariable Long id) {
        Optional<KYC> kycOpt = kycRepository.findById(id);
        if (kycOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("KYC not found");
        }
        KYC kyc = kycOpt.get();
        kyc.setStatus(KYCStatus.APPROVED);
        kycRepository.save(kyc);

        // Update user's kycStatus
        User user = kyc.getUser();
        user.setKycStatus(KYCStatus.APPROVED);
        userRepository.save(user);

        return ResponseEntity.ok("KYC approved.");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectKyc(@PathVariable Long id) {
        Optional<KYC> kycOpt = kycRepository.findById(id);
        if (kycOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("KYC not found");
        }
        KYC kyc = kycOpt.get();
        kyc.setStatus(KYCStatus.REJECTED);
        kycRepository.save(kyc);

        // Update user's kycStatus
        User user = kyc.getUser();
        user.setKycStatus(KYCStatus.REJECTED);
        userRepository.save(user);

        return ResponseEntity.ok("KYC rejected.");
    }
} 