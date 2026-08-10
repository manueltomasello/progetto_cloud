package com.gestionale.auth.controller;

import com.gestionale.auth.dto.LoginRequest;
import com.gestionale.auth.entity.Operatore;
import com.gestionale.auth.repository.OperatoreRepository;
import com.gestionale.auth.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String COOKIE_NAME = "vuepost-access-token";

    private final OperatoreRepository repo;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(OperatoreRepository repo, JwtService jwt) {
        this.repo = repo;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        Optional<Operatore> found = repo.findByUsername(body.getUsername());
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Credenziali Errate");
        }
        Operatore user = found.get();
        if (!encoder.matches(body.getPassword(), user.getPassDip())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Credenziali Errate");
        }
        String token = jwt.generateToken(user);
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true).sameSite("Strict").path("/")
                .maxAge(jwt.cookieMaxAgeSeconds())
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Login effettuato con successo"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true).sameSite("Strict").path("/").maxAge(0).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logout effettuato con successo"));
    }

    @GetMapping("/getProfile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        String token = readCookie(request);
        if (token == null) return ResponseEntity.ok(null);
        try {
            Claims c = jwt.parse(token);
            Map<String, Object> user = new HashMap<>();
            user.put("IdDip", c.get("IdDip"));
            user.put("username", c.get("username"));
            user.put("ruolo", c.get("ruolo"));
            user.put("NomeDip", c.get("NomeDip"));
            user.put("CognDip", c.get("CognDip"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    private String readCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (var ck : request.getCookies()) {
            if (COOKIE_NAME.equals(ck.getName())) return ck.getValue();
        }
        return null;
    }
}
