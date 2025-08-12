package com.solarcapital.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your OTP Code");
            message.setText("Your OTP code is: " + otp);
            mailSender.send(message);
            System.out.println("[DEBUG] Email sent successfully to: " + to + " from: " + fromEmail);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send email to: " + to + " - " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("[DEBUG] Email sent successfully to: " + to + " from: " + fromEmail);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send email to: " + to + " - " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(attachment));
            mailSender.send(message);
            System.out.println("[DEBUG] Email with attachment sent successfully to: " + to + " from: " + fromEmail);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send email with attachment to: " + to + " - " + e.getMessage());
            e.printStackTrace();
        }
    }
}
