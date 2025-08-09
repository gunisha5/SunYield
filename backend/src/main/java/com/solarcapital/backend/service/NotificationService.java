package com.solarcapital.backend.service;

import com.solarcapital.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    @Autowired
    private EmailService emailService;
    @Autowired
    private SmsService smsService;

    public void notifyCreditAddition(User user, String message) {
        emailService.sendEmail(user.getEmail(), "Reward Added to Your Wallet", message);
        smsService.sendSms(user.getContact(), message);
    }

    public void notifyWithdrawalStatus(User user, String message) {
        emailService.sendEmail(user.getEmail(), "Withdrawal Status Update", message);
        smsService.sendSms(user.getContact(), message);
    }

    public void sendMonthlyPerformanceSummary(User user, String summary) {
        emailService.sendEmail(user.getEmail(), "Your Monthly Performance Summary", summary);
        smsService.sendSms(user.getContact(), summary);
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        emailService.sendEmailWithAttachment(to, subject, body, attachment, filename);
    }
} 