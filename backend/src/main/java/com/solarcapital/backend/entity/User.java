package com.solarcapital.backend.entity;

import jakarta.persistence.*;
import java.util.Set;

@Entity
public class    User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    private String fullName;

    private String contact;

    @Enumerated(EnumType.STRING)
    private KYCStatus kycStatus = KYCStatus.PENDING;

    private boolean isVerified = false;

    private String otp;

    private Long otpGeneratedTime;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public KYCStatus getKycStatus() { return kycStatus; }
    public void setKycStatus(KYCStatus kycStatus) { this.kycStatus = kycStatus; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Long getOtpGeneratedTime() { return otpGeneratedTime; }
    public void setOtpGeneratedTime(Long otpGeneratedTime) { this.otpGeneratedTime = otpGeneratedTime; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}