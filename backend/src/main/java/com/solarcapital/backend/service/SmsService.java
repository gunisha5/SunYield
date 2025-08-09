package com.solarcapital.backend.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void sendSms(String phoneNumber, String message) {
        // TODO: Integrate with real SMS provider (e.g., Twilio, MSG91, etc.)
        System.out.println("[SMS] To: " + phoneNumber + ", Message: " + message);
    }
} 