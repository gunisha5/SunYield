package com.solarcapital.backend.security;

import com.solarcapital.backend.util.JwtUtil;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        
        // Skip JWT filter for public endpoints
        if (isPublicEndpoint(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        
        System.out.println("[DEBUG] JwtFilter running for request: " + requestURI); // DEBUG point
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            email = jwtUtil.extractEmail(token);
            System.out.println("[DEBUG] Extracted email from JWT: " + email); // DEBUG point
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent() && jwtUtil.validateToken(token)) {
                User user = userOpt.get();
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("[DEBUG] Authentication set for user: " + user.getEmail()); // DEBUG point
            }
        }
        chain.doFilter(request, response);
        System.out.println("[DEBUG] Authentication in SecurityContext after filter: " + SecurityContextHolder.getContext().getAuthentication()); // DEBUG point
    }
    
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/auth/") || 
               requestURI.startsWith("/admin/login") ||
               requestURI.startsWith("/admin/generate-hash") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.equals("/swagger-ui.html") ||
               requestURI.equals("/api/energy/record");
    }
} 